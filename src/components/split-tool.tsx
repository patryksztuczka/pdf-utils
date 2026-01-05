import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { splitPDF, getPDFPageCount } from "@/lib/pdf-utils";
import {
  Scissors,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import { usePDFDocument } from "@/hooks/use-pdf";
import { PDFPreviewPanel } from "./pdf-preview-panel";
import { ToolEmptyState, DragOverlay, SelectedFileCard } from "./tool-ui";
import { useToolHeader } from "@/hooks/use-tool-header";

interface SplitPoint {
  id: string;
  page: number | "";
}

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitPoints, setSplitPoints] = useState<SplitPoint[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [activeSplitPage, setActiveSplitPage] = useState<{
    page: number;
    timestamp: number;
  } | null>(null);
  const { setHeader } = useToolHeader();

  const getValidSortedSplitPages = useCallback(() => {
    return splitPoints
      .map((sp) => sp.page)
      .filter(
        (p): p is number => typeof p === "number" && p >= 1 && p < totalPages,
      )
      .sort((a, b) => a - b)
      .filter((item, index, array) => array.indexOf(item) === index);
  }, [splitPoints, totalPages]);

  const handleSplit = useCallback(async () => {
    if (!file) return;
    const validPages = getValidSortedSplitPages();
    if (validPages.length === 0) return;

    setIsProcessing(true);
    try {
      const pdfBytesArray = await splitPDF(file, validPages);

      const zip = new JSZip();
      pdfBytesArray.forEach((bytes, index) => {
        zip.file(
          `${file.name.replace(".pdf", "")}-part${index + 1}.pdf`,
          bytes,
        );
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-split.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to split PDF", error);
      alert("Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  }, [file, getValidSortedSplitPages]);

  const validPages = getValidSortedSplitPages();
  const hasInvalidOrder = splitPoints.some((sp, index) => {
    if (index === 0) return false;
    const prev = splitPoints[index - 1];
    return (
      typeof sp.page === "number" &&
      typeof prev.page === "number" &&
      sp.page <= prev.page
    );
  });

  useEffect(() => {
    setHeader({
      title: "Split PDF",
      description: "Separate one file into multiple parts",
      action: {
        label: "Split & Download Zip",
        onClick: handleSplit,
        disabled: !file || validPages.length === 0 || totalPages <= 1 || hasInvalidOrder,
        loading: isProcessing,
        loadingLabel: "Processing...",
        icon: Scissors,
      },
    });
  }, [file, validPages.length, totalPages, hasInvalidOrder, isProcessing, handleSplit, setHeader]);

  // Load PDF for preview
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
    async function loadPageCount() {
      if (file) {
        setIsLoadingFile(true);
        try {
          const count = await getPDFPageCount(file);
          setTotalPages(count);
          setSplitPoints([{ id: uuidv4(), page: Math.floor(count / 2) || 1 }]);
        } catch (error) {
          console.error("Failed to load PDF", error);
          alert("Failed to load PDF. Is it a valid file?");
          setFile(null);
        } finally {
          setIsLoadingFile(false);
        }
      } else {
        setTotalPages(0);
        setSplitPoints([]);
      }
    }
    loadPageCount();
  }, [file]);

  const removeFile = () => {
    setFile(null);
    setTotalPages(0);
    setSplitPoints([]);
  };

  const addSplitPoint = () => {
    setSplitPoints((prev) => [...prev, { id: uuidv4(), page: "" }]);
  };

  const removeSplitPoint = (id: string) => {
    if (splitPoints.length <= 1) return;
    setSplitPoints((prev) => prev.filter((sp) => sp.id !== id));
  };

  const updateSplitPoint = (id: string, value: string) => {
    const numValue = parseInt(value);
    setSplitPoints((prev) =>
      prev.map((sp) => {
        if (sp.id === id) {
          return { ...sp, page: isNaN(numValue) ? "" : numValue };
        }
        return sp;
      }),
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 w-full h-full overflow-hidden">
        {/* Left Column: File List / Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            !file ? "lg:col-span-12" : "lg:col-span-8",
            "flex flex-col min-h-0 relative transition-all h-full overflow-hidden",
            isDragActive && "bg-primary/5",
          )}
        >
          <input {...getInputProps()} />

          {/* Drag Overlay */}
          {isDragActive && <DragOverlay label="Drop PDF to split it" />}

          {!file ? (
            <div className="flex-1 p-8">
              <ToolEmptyState
                onClick={open}
                icon={Scissors}
                title="Select PDF to Split"
                description="Click to browse or drag and drop your file here"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6">
              <div className="mb-6">
                 <SelectedFileCard
                  file={file}
                  onRemove={removeFile}
                  isLoading={isLoadingFile}
                  subtext={isLoadingFile ? "Counting pages..." : `${totalPages} pages`}
                />
              </div>

              <Card className="flex-1 min-h-0 flex flex-col border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                <CardContent className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                  {!isLoadingFile && totalPages > 1 ? (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                          Split Points
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addSplitPoint}
                          className="h-7 gap-1 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          Add Point
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0 pb-4">
                        {splitPoints.map((sp, index) => {
                          const prevPage =
                            index > 0 &&
                            typeof splitPoints[index - 1].page === "number"
                              ? (splitPoints[index - 1].page as number)
                              : 0;
                          const minPage = prevPage + 1;
                          const isInvalidOrder =
                            typeof sp.page === "number" && sp.page <= prevPage;

                          // Calculate range for this part
                          const startPage = prevPage + 1;
                          const endPage =
                            typeof sp.page === "number" ? sp.page : "?";

                          return (
                            <div
                              key={sp.id}
                              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in slide-in-from-left-2 fade-in duration-200 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
                            >
                              <div className="flex items-center gap-2 flex-1 w-full">
                                <span className="text-sm font-medium w-20 text-neutral-500">
                                  Part {index + 1}
                                </span>
                                <div className="flex-1 relative flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={minPage}
                                    max={totalPages - 1}
                                    placeholder="#"
                                    value={sp.page}
                                    onChange={(e) =>
                                      updateSplitPoint(sp.id, e.target.value)
                                    }
                                    className={cn(
                                      isInvalidOrder &&
                                        "border-red-500 focus-visible:ring-red-500",
                                      "bg-white dark:bg-neutral-950",
                                    )}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-neutral-400 hover:text-primary shrink-0"
                                    title="Show in Preview"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (typeof sp.page === "number") {
                                        setActiveSplitPage({
                                          page: sp.page,
                                          timestamp: Date.now(),
                                        });
                                      }
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                <div className="px-3 py-1.5 rounded-md bg-white dark:bg-neutral-950 text-xs text-neutral-500 font-mono whitespace-nowrap border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                  Pages {startPage} - {endPage}
                                </div>
                                {splitPoints.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-neutral-400 hover:text-red-500 shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSplitPoint(sp.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Final Part Display */}
                        {(() => {
                          const lastSp = splitPoints[splitPoints.length - 1];
                          const lastPage =
                            typeof lastSp?.page === "number" ? lastSp.page : 0;
                          if (lastPage < totalPages) {
                            return (
                              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-500">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm font-medium w-20">
                                    Part {splitPoints.length + 1}
                                  </span>
                                  <span className="text-xs italic">
                                    Remaining pages
                                  </span>
                                </div>
                                <div className="px-3 py-1.5 rounded-md bg-white dark:bg-neutral-950 text-xs text-neutral-500 font-mono whitespace-nowrap border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                  Pages {lastPage + 1} - {totalPages}
                                </div>
                                {splitPoints.length > 1 && (
                                  <div className="w-9" />
                                )}{" "}
                                {/* Spacer to align with delete button */}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  ) : !isLoadingFile ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mb-4">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Document too short</h4>
                      <p className="text-sm text-neutral-500 max-w-xs">
                        This document only has one page and cannot be split further.
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        {file && (
          <div className="hidden lg:block lg:col-span-4 h-full min-h-0 border-l border-neutral-200 dark:border-neutral-800">
            <PDFPreviewPanel
              file={file}
              pdf={pdf}
              splitPoints={validPages}
              scrollToPage={activeSplitPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
