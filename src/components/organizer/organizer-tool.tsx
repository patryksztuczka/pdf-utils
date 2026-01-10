import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { extractPages, getPDFPageCount } from "@/lib/pdf-utils";
import { LayoutGrid, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { usePDFDocument } from "@/hooks/use-pdf";
import {
  ToolEmptyState,
  DragOverlay,
  SelectedFileCard,
  PDFThumbnail,
} from "@/components/shared";
import { useToolHeader } from "@/hooks/use-tool-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import JSZip from "jszip";
import { GroupCard } from "./group-card";

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
  const [checkedGroupIds, setCheckedGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const { setHeader } = useToolHeader();
  const isMobile = useIsMobile();

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const previewPages = selectedGroup
    ? selectedGroup.pages
    : selectedPage
      ? [selectedPage]
      : [];

  const actualGroups = groups.filter((g) => g.pages.length > 1);
  const subtext = isLoadingFile
    ? "Processing..."
    : actualGroups.length > 0
      ? `${totalPages} pages (${actualGroups.length} groups)`
      : `${totalPages} pages`;

  const handleDownloadZip = useCallback(async () => {
    if (!file || checkedGroupIds.size === 0) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const selectedGroups = groups.filter((g) => checkedGroupIds.has(g.id));

      for (let i = 0; i < selectedGroups.length; i++) {
        const group = selectedGroups[i];
        const indices = group.pages.map((p) => p - 1).sort((a, b) => a - b);
        const pdfBytes = (await extractPages(file, indices)) as any;

        const fileName =
          selectedGroups.length === 1
            ? `${file.name.replace(".pdf", "")}-extracted.pdf`
            : `${file.name.replace(".pdf", "")}-part-${i + 1}.pdf`;

        zip.file(fileName, pdfBytes);
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
      action:
        checkedGroupIds.size > 0
          ? {
              label: `Download ZIP (${checkedGroupIds.size})`,
              onClick: handleDownloadZip,
              icon: Download,
              loading: isProcessing,
              loadingLabel: "Generating ZIP...",
            }
          : null,
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
    setCheckedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setCheckedGroupIds(new Set(groups.map((g) => g.id)));
  };

  const deselectAll = () => {
    setCheckedGroupIds(new Set());
  };

  const handleDownloadGroup = async (group: PageGroup) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const indices = group.pages.map((p) => p - 1).sort((a, b) => a - b);
      const pdfBytes = (await extractPages(file, indices)) as any;
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
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
      const pdfBytes = (await extractPages(file, [page - 1])) as any;
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
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

  const movePageToGroup = (
    page: number,
    sourceGroupId: string,
    targetGroupId: string,
  ) => {
    if (sourceGroupId === targetGroupId) return;

    setGroups((prev) => {
      const newGroups = prev
        .map((group) => {
          if (group.id === sourceGroupId) {
            return { ...group, pages: group.pages.filter((p) => p !== page) };
          }
          if (group.id === targetGroupId) {
            return {
              ...group,
              pages: [...group.pages, page].sort((a, b) => a - b),
            };
          }
          return group;
        })
        .filter((group) => group.pages.length > 0);

      return newGroups;
    });
  };

  const ungroupPage = (page: number, groupId: string) => {
    setGroups((prev) => {
      const group = prev.find((g) => g.id === groupId);
      if (!group || group.pages.length <= 1) return prev;

      const newGroup = { id: uuidv4(), pages: [page] };
      return prev
        .map((g) => {
          if (g.id === groupId) {
            return { ...g, pages: g.pages.filter((p) => p !== page) };
          }
          return g;
        })
        .concat(newGroup);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <ResizablePanelGroup
        key={!file ? "empty" : "with-file"}
        orientation={isMobile ? "vertical" : "horizontal"}
        className="flex-1 min-h-0 w-full h-full overflow-hidden"
      >
        <ResizablePanel
          defaultSize={!file ? 100 : 75}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <div
            {...getRootProps()}
            className={cn(
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
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-50">
                    <SelectedFileCard
                      file={file}
                      onRemove={removeFile}
                      isLoading={isLoadingFile}
                      subtext={subtext}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      className="h-9 px-3 text-xs font-semibold"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAll}
                      disabled={checkedGroupIds.size === 0}
                      className="h-9 px-3 text-xs font-semibold"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-10">
                  <div className="flex flex-wrap gap-x-6 gap-y-10">
                    {groups.map((group) => (
                      <div key={group.id} className="w-40 shrink-0">
                        <GroupCard
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        {file && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={25}
              minSize={15}
              className="h-full min-h-0 flex flex-col overflow-hidden bg-white dark:bg-neutral-950"
            >
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500">
                  {selectedGroup && selectedGroup.pages.length > 1
                    ? `Group Preview (${selectedGroup.pages.length} Pages)`
                    : "Page Preview"}
                </h3>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  {selectedGroup && selectedGroup.pages.length > 1
                    ? `${selectedGroup.pages.length} PAGES`
                    : `PAGE ${selectedGroup?.pages[0] || selectedPage}`}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/30 dark:bg-neutral-900/30">
                <div className="mx-auto space-y-8">
                  {previewPages.length > 0 ? (
                    previewPages.map((pageNumber) => (
                      <div key={pageNumber} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-neutral-400">
                            PAGE {pageNumber}
                          </span>
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
                          scale={1.5}
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
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
                  <Button
                    className="w-full gap-2 font-semibold"
                    onClick={() => handleDownloadGroup(selectedGroup)}
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4" />
                    {selectedGroup.pages.length > 1
                      ? "Save Group as PDF"
                      : "Save Page as PDF"}
                  </Button>
                </div>
              )}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
