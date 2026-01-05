import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { extractPages, getPDFPageCount } from "@/lib/pdf-utils";
import {
  LayoutGrid,
  Download,
  Trash2,
  GripVertical,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { usePDFDocument } from "@/hooks/use-pdf";
import { PDFThumbnail } from "./pdf-thumbnail";
import { ToolHeader, ToolEmptyState, DragOverlay, SelectedFileCard } from "./tool-ui";
import { renderPageToDataURL } from "@/lib/pdf-render";

interface PageGroup {
  id: string;
  pages: number[]; // 1-based page numbers
}

export function OrganizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [groups, setGroups] = useState<PageGroup[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { pdf } = usePDFDocument(file);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    noClick: true,
  });

  useEffect(() => {
    async function loadFile() {
      if (file) {
        setIsLoadingFile(true);
        try {
          const count = await getPDFPageCount(file);
          setTotalPages(count);
          // Initial state: Every page is its own group
          const initialGroups = Array.from({ length: count }, (_, i) => ({
            id: uuidv4(),
            pages: [i + 1],
          }));
          setGroups(initialGroups);
          setSelectedPage(1);
        } catch (error) {
          console.error("Failed to load PDF", error);
          setFile(null);
        } finally {
          setIsLoadingFile(false);
        }
      } else {
        setTotalPages(0);
        setGroups([]);
        setSelectedPage(null);
        setPreviewUrl(null);
      }
    }
    loadFile();
  }, [file]);

  // Update large preview when selected page changes
  useEffect(() => {
    async function updatePreview() {
      if (pdf && selectedPage) {
        setIsPreviewLoading(true);
        try {
          const url = await renderPageToDataURL(pdf, selectedPage, 1.5);
          setPreviewUrl(url);
        } catch (e) {
          console.error("Failed to render preview", e);
        } finally {
          setIsPreviewLoading(false);
        }
      }
    }
    updatePreview();
  }, [pdf, selectedPage]);

  const removeFile = () => {
    setFile(null);
  };

  const handleDownloadGroup = async (group: PageGroup) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // 0-based indices for extractPages
      const indices = group.pages.map(p => p - 1).sort((a, b) => a - b);
      const pdfBytes = await extractPages(file, indices);
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-group-${group.pages.join("-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download group", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSinglePage = async (page: number) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await extractPages(file, [page - 1]);
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-page-${page}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download page", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const movePageToGroup = (page: number, sourceGroupId: string, targetGroupId: string) => {
    if (sourceGroupId === targetGroupId) return;

    setGroups(prev => {
      const newGroups = prev.map(group => {
        // Remove from source
        if (group.id === sourceGroupId) {
          return { ...group, pages: group.pages.filter(p => p !== page) };
        }
        // Add to target
        if (group.id === targetGroupId) {
          return { ...group, pages: [...group.pages, page].sort((a, b) => a - b) };
        }
        return group;
      }).filter(group => group.pages.length > 0);

      return newGroups;
    });
  };

  const ungroupPage = (page: number, groupId: string) => {
    setGroups(prev => {
      const group = prev.find(g => g.id === groupId);
      if (!group || group.pages.length <= 1) return prev;

      const newGroup = { id: uuidv4(), pages: [page] };
      return prev.map(g => {
        if (g.id === groupId) {
          return { ...g, pages: g.pages.filter(p => p !== page) };
        }
        return g;
      }).concat(newGroup);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <ToolHeader
        title="PDF Organizer"
        description="Attach a file, group pages, and download custom selections"
        actionIcon={LayoutGrid}
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-full overflow-hidden">
        {/* Left/Middle Column: Groups Grid */}
        <div
          {...getRootProps()}
          className={cn(
            !file ? "lg:col-span-12" : "lg:col-span-8",
            "flex flex-col gap-6 min-h-0 relative rounded-xl border-2 transition-all h-full overflow-hidden",
            isDragActive
              ? "border-primary bg-primary/5 border-dashed"
              : "border-transparent",
          )}
        >
          <input {...getInputProps()} />

          {isDragActive && <DragOverlay label="Drop PDF to organize it" />}

          {!file ? (
            <ToolEmptyState
              onClick={open}
              icon={LayoutGrid}
              title="Select PDF to Organize"
              description="Group pages, reorder them, and extract parts of your document"
            />
          ) : (
            <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden">
              <SelectedFileCard
                file={file}
                onRemove={removeFile}
                isLoading={isLoadingFile}
                subtext={isLoadingFile ? "Processing..." : `${totalPages} pages organized into ${groups.length} groups`}
              />

              <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      pdf={pdf}
                      selectedPage={selectedPage}
                      onSelectPage={setSelectedPage}
                      onDownloadGroup={() => handleDownloadGroup(group)}
                      onDownloadPage={handleDownloadSinglePage}
                      onMovePage={movePageToGroup}
                      onUngroupPage={ungroupPage}
                      isProcessing={isProcessing}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        {file && (
          <div className="hidden lg:flex lg:col-span-4 h-full min-h-0 flex-col rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <h3 className="font-semibold text-sm">Page Preview</h3>
              <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                Page {selectedPage}
              </span>
            </div>
            
            <div className="flex-1 overflow-auto p-6 flex items-start justify-center bg-neutral-100/30 dark:bg-neutral-900/30">
              {isPreviewLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={`Preview of page ${selectedPage}`} 
                  className="max-w-full h-auto shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black"
                />
              ) : (
                <div className="text-neutral-400 text-sm italic">Select a page to preview</div>
              )}
            </div>
            
            {selectedPage && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => handleDownloadSinglePage(selectedPage)}
                  disabled={isProcessing}
                >
                  <Download className="h-4 w-4" />
                  Save Page {selectedPage} as PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: PageGroup;
  pdf: any;
  selectedPage: number | null;
  onSelectPage: (page: number) => void;
  onDownloadGroup: () => void;
  onDownloadPage: (page: number) => void;
  onMovePage: (page: number, sourceId: string, targetId: string) => void;
  onUngroupPage: (page: number, groupId: string) => void;
  isProcessing: boolean;
}

function GroupCard({
  group,
  pdf,
  selectedPage,
  onSelectPage,
  onDownloadGroup,
  onDownloadPage,
  onMovePage,
  onUngroupPage,
  isProcessing
}: GroupCardProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const data = e.dataTransfer.getData("application/pdf-organizer");
    if (data) {
      const { page, groupId } = JSON.parse(data);
      onMovePage(page, groupId, group.id);
    }
  };

  return (
    <Card 
      className={cn(
        "border-neutral-200 dark:border-neutral-800 transition-all overflow-hidden flex flex-col",
        isOver && "ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-950 shadow-lg scale-[1.02]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <FileText className="h-3 w-3 text-neutral-500" />
          </div>
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-tight">
            {group.pages.length === 1 ? "Single Page" : "Grouped Pages"}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-neutral-400 hover:text-primary"
          onClick={onDownloadGroup}
          disabled={isProcessing}
          title="Download as PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4 flex-1">
        <div className="flex flex-wrap gap-3">
          {group.pages.map((page) => (
            <DraggablePageThumbnail
              key={page}
              page={page}
              pdf={pdf}
              groupId={group.id}
              isSelected={selectedPage === page}
              onSelect={() => onSelectPage(page)}
              onDownload={() => onDownloadPage(page)}
              onUngroup={group.pages.length > 1 ? () => onUngroupPage(page, group.id) : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DraggablePageProps {
  page: number;
  pdf: any;
  groupId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onUngroup?: () => void;
}

function DraggablePageThumbnail({
  page,
  pdf,
  groupId,
  isSelected,
  onSelect,
  onDownload,
  onUngroup
}: DraggablePageProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/pdf-organizer", JSON.stringify({ page, groupId }));
    // Create a ghost image if needed, but default is fine
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative w-24 flex flex-col gap-1.5 cursor-pointer group",
        isDragging && "opacity-40"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "relative aspect-[1/1.414] rounded-md overflow-hidden border-2 transition-all shadow-sm",
        isSelected 
          ? "border-primary ring-2 ring-primary/20 scale-[1.05] z-10" 
          : "border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-300 dark:group-hover:border-neutral-600"
      )}>
        <PDFThumbnail 
          pdf={pdf} 
          pageNumber={page} 
          scale={0.3} 
          className="w-full h-full border-0" 
        />
        
        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-7 w-7 rounded-full bg-white text-black hover:bg-white/90"
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            title="Download this page"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {onUngroup && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={(e) => { e.stopPropagation(); onUngroup(); }}
              title="Remove from group"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
          P{page}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-1 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
        <GripVertical className="h-3 w-3" />
        <span className="text-[10px] font-medium uppercase">Drag</span>
      </div>
    </div>
  );
}
