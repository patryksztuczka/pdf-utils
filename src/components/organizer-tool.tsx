import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { extractPages, getPDFPageCount } from "@/lib/pdf-utils";
import {
  LayoutGrid,
  Download,
  Trash2,
  Check,
  Square,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { usePDFDocument } from "@/hooks/use-pdf";
import { PDFThumbnail } from "./pdf-thumbnail";
import { ToolEmptyState, DragOverlay, SelectedFileCard } from "./tool-ui";
import { useToolHeader } from "@/hooks/use-tool-header";
import JSZip from "jszip";

interface PageGroup {
  id: string;
  pages: number[]; // 1-based page numbers
}

export function OrganizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [groups, setGroups] = useState<PageGroup[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [checkedGroupIds, setCheckedGroupIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const { setHeader } = useToolHeader();

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const previewPages = selectedGroup ? selectedGroup.pages : selectedPage ? [selectedPage] : [];

  const handleDownloadZip = useCallback(async () => {
    if (!file || checkedGroupIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const selectedGroups = groups.filter(g => checkedGroupIds.has(g.id));
      
      for (let i = 0; i < selectedGroups.length; i++) {
        const group = selectedGroups[i];
        const indices = group.pages.map(p => p - 1).sort((a, b) => a - b);
        const pdfBytes = await extractPages(file, indices);
        
        const fileName = selectedGroups.length === 1 
          ? `${file.name.replace(".pdf", "")}-extracted.pdf`
          : `${file.name.replace(".pdf", "")}-part-${i + 1}.pdf`;
          
        zip.file(fileName, pdfBytes as any);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-selection.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate ZIP", e);
      alert("Failed to generate ZIP file.");
    } finally {
      setIsProcessing(false);
    }
  }, [file, groups, checkedGroupIds]);

  useEffect(() => {
    setHeader({
      title: "PDF Organizer",
      description: "Attach a file, group pages, and download custom selections",
      action: checkedGroupIds.size > 0 ? {
        label: `Download ZIP (${checkedGroupIds.size})`,
        onClick: handleDownloadZip,
        icon: Download,
        loading: isProcessing,
        loadingLabel: "Generating ZIP...",
      } : null,
    });
  }, [setHeader, checkedGroupIds.size, handleDownloadZip, isProcessing]);

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
          const initialGroups = Array.from({ length: count }, (_, i) => ({
            id: uuidv4(),
            pages: [i + 1],
          }));
          setGroups(initialGroups);
          setSelectedPage(1);
          setSelectedGroupId(initialGroups[0].id);
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
        setSelectedGroupId(null);
        setCheckedGroupIds(new Set());
      }
    }
    loadFile();
  }, [file]);

  const removeFile = () => {
    setFile(null);
  };

  const toggleCheckGroup = (id: string) => {
    setCheckedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setCheckedGroupIds(new Set(groups.map(g => g.id)));
  };

  const deselectAll = () => {
    setCheckedGroupIds(new Set());
  };

  const handleDownloadGroup = async (group: PageGroup) => {
    if (!file) return;
    setIsProcessing(true);
    try {
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
        if (group.id === sourceGroupId) {
          return { ...group, pages: group.pages.filter(p => p !== page) };
        }
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
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 w-full h-full overflow-hidden">
        <div
          {...getRootProps()}
          className={cn(
            !file ? "lg:col-span-12" : "lg:col-span-7",
            "flex-1 flex flex-col min-h-0 relative transition-all h-full overflow-hidden",
            isDragActive && "bg-primary/5",
          )}
        >
          <input {...getInputProps()} />

          {isDragActive && <DragOverlay label="Drop PDF to organize it" />}

          {!file ? (
            <div className="flex-1 p-8">
              <ToolEmptyState
                onClick={open}
                icon={LayoutGrid}
                title="Select PDF to Organize"
                description="Group pages, reorder them, and extract parts of your document"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <SelectedFileCard
                    file={file}
                    onRemove={removeFile}
                    isLoading={isLoadingFile}
                    subtext={isLoadingFile ? "Processing..." : `${totalPages} pages organized into ${groups.length} groups`}
                  />
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="h-9 gap-2 px-3 text-xs font-semibold"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    disabled={checkedGroupIds.size === 0}
                    className="h-9 gap-2 px-3 text-xs font-semibold"
                  >
                    <Square className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      pdf={pdf}
                      isSelected={selectedGroupId === group.id}
                      isChecked={checkedGroupIds.has(group.id)}
                      onSelect={() => setSelectedGroupId(group.id)}
                      onToggleCheck={() => toggleCheckGroup(group.id)}
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

        {file && (
          <div className="hidden lg:flex lg:col-span-5 h-full min-h-0 flex-col overflow-hidden border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500">
                {selectedGroup ? `Group Preview (${selectedGroup.pages.length} Pages)` : 'Page Preview'}
              </h3>
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                {selectedGroup ? `${selectedGroup.pages.length} PAGES` : `PAGE ${selectedPage}`}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/30 dark:bg-neutral-900/30">
               <div className="max-w-md mx-auto space-y-8">
                {previewPages.length > 0 ? (
                  previewPages.map((pageNumber) => (
                    <div key={pageNumber} className="space-y-2">
                       <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-neutral-400">PAGE {pageNumber}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-neutral-400 hover:text-primary"
                            onClick={() => handleDownloadSinglePage(pageNumber)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                       </div>
                       <PDFThumbnail 
                        pdf={pdf} 
                        pageNumber={pageNumber} 
                        scale={1} 
                        className="w-full h-auto shadow-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black"
                      />
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">
                    Select a group or page to preview
                  </div>
                )}
               </div>
            </div>
            
            {selectedGroup && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <Button 
                  className="w-full gap-2 font-semibold" 
                  onClick={() => handleDownloadGroup(selectedGroup)}
                  disabled={isProcessing}
                >
                  <Download className="h-4 w-4" />
                  Save Group as PDF
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
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  onDownloadGroup: () => void;
  onDownloadPage: (page: number) => void;
  onMovePage: (page: number, sourceId: string, targetId: string) => void;
  onUngroupPage: (page: number, groupId: string) => void;
  isProcessing: boolean;
}

function GroupCard({
  group,
  pdf,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
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
    <div 
      className={cn(
        "relative flex flex-col items-center group transition-all isolate",
        isOver && "scale-[1.05]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onSelect}
    >
      <div className="relative w-full aspect-[1/1.414]">
        <div 
          className={cn(
            "absolute top-2 left-2 z-50 h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer",
            isChecked 
              ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
              : "bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-700 opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck();
          }}
        >
          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
        </div>

        {group.pages.length > 1 && (
          <>
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md translate-x-2 translate-y-2 -z-20" />
            <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md translate-x-1 translate-y-1 -z-10" />
          </>
        )}

        <div className={cn(
          "h-full w-full bg-white dark:bg-neutral-950 rounded-md border-2 overflow-hidden shadow-sm transition-all",
          isOver ? "border-primary ring-2 ring-primary/20" : 
          isChecked ? "border-blue-500 ring-4 ring-blue-500/10" :
          isSelected ? "border-primary shadow-md" : 
          "border-neutral-200 dark:border-neutral-800"
        )}>
          <DraggablePageThumbnail
            page={group.pages[0]}
            pdf={pdf}
            groupId={group.id}
            onSelect={onSelect}
            onDownload={() => onDownloadPage(group.pages[0])}
            onUngroup={group.pages.length > 1 ? () => onUngroupPage(group.pages[0], group.id) : undefined}
          />
        </div>

        {group.pages.length > 1 && (
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-50"
            onClick={(e) => { e.stopPropagation(); onDownloadGroup(); }}
            disabled={isProcessing}
          >
            <Download className="h-3 w-3" />
          </Button>
        )}

        {group.pages.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md z-40">
            {group.pages.length} PAGES
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center w-full">
         <span className={cn(
           "text-[10px] font-bold uppercase tracking-tighter truncate px-2 transition-colors",
           isChecked ? "text-blue-500" : isSelected ? "text-primary" : "text-neutral-400"
         )}>
            {group.pages.length === 1 ? 'Single Page' : `Group (${group.pages.length})`}
         </span>
      </div>
    </div>
  );
}

interface DraggablePageProps {
  page: number;
  pdf: any;
  groupId: string;
  onSelect: () => void;
  onDownload: () => void;
  onUngroup?: () => void;
}

function DraggablePageThumbnail({
  page,
  pdf,
  groupId,
  onSelect,
  onDownload,
  onUngroup
}: DraggablePageProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/pdf-organizer", JSON.stringify({ page, groupId }));
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
        "relative w-full h-full cursor-pointer group/thumb",
        isDragging && "opacity-40"
      )}
      onClick={onSelect}
    >
      <PDFThumbnail 
        pdf={pdf} 
        pageNumber={page} 
        scale={0.3} 
        className="w-full h-full border-0 rounded-none shadow-none" 
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90"
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          title="Download this page"
        >
          <Download className="h-4 w-4" />
        </Button>
        {onUngroup && (
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={(e) => { e.stopPropagation(); onUngroup(); }}
            title="Remove from group"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
        P{page}
      </div>
    </div>
  );
}
