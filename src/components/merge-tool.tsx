import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { mergePDFs } from "@/lib/pdf-utils";
import { Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { MergeFileItem } from "./merge-file-item";
import { PDFPreviewPanel } from "./pdf-preview-panel";
import { usePDFDocument } from "@/hooks/use-pdf";
import { ToolEmptyState, DragOverlay } from "./tool-ui";
import { useToolHeader } from "@/hooks/use-tool-header";

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setHeader } = useToolHeader();

  const handleMerge = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files);
      const blob = new Blob([mergedPdfBytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to merge PDFs", error);
      alert("Failed to merge PDFs.");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  useEffect(() => {
    setHeader({
      title: "Merge PDFs",
      description: "Combine multiple files into one document",
      action: {
        label: "Merge Files",
        onClick: handleMerge,
        disabled: files.length < 2,
        loading: isProcessing,
        loadingLabel: "Merging...",
        icon: Download,
      },
    });
  }, [files, isProcessing, handleMerge, setHeader]);

  // Load the PDF proxy for the currently selected file for the preview panel
  const selectedFile = files[selectedFileIndex] || null;
  const { pdf: selectedPdf } = usePDFDocument(selectedFile);

  // Custom onDrop wrapper to handle selection
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFiles((prev) => {
      const next = [...prev, ...acceptedFiles];
      // Select the last added file
      setTimeout(() => setSelectedFileIndex(next.length - 1), 0);
      return next;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    noClick: true, // Important: disable click on root, use open() on specific buttons
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Adjust selection if needed
      if (selectedFileIndex >= newFiles.length) {
        setSelectedFileIndex(Math.max(0, newFiles.length - 1));
      } else if (index < selectedFileIndex) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
      return newFiles;
    });
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newFiles.length) {
        [newFiles[index], newFiles[targetIndex]] = [
          newFiles[targetIndex],
          newFiles[index],
        ];

        // Follow the file with selection
        if (selectedFileIndex === index) setSelectedFileIndex(targetIndex);
        else if (selectedFileIndex === targetIndex) setSelectedFileIndex(index);
      }
      return newFiles;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      {/* Main Grid Content */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 w-full h-full overflow-hidden">
        {/* Left Column: File List / Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            files.length === 0 ? "lg:col-span-12" : "lg:col-span-8",
            "flex flex-col min-h-0 relative transition-all h-full overflow-hidden",
            isDragActive && "bg-primary/5",
          )}
        >
          <input {...getInputProps()} />

          {/* Drag Overlay */}
          {isDragActive && <DragOverlay />}

          {files.length === 0 ? (
            <div className="flex-1 p-8">
              <ToolEmptyState
                onClick={open}
                icon={Plus}
                title="Add PDF Files"
                description="Click to browse or drag and drop your files here"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6">
              <div className="flex-none flex items-center justify-between px-1 mb-4">
                <h3 className="font-semibold text-sm text-neutral-500 uppercase tracking-wider">
                  {files.length} Files to merge
                </h3>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <MergeFileItem
                      key={`${file.name}-${index}`}
                      file={file}
                      index={index}
                      total={files.length}
                      isSelected={index === selectedFileIndex}
                      onSelect={() => setSelectedFileIndex(index)}
                      onRemove={() => removeFile(index)}
                      onMoveUp={() => moveFile(index, "up")}
                      onMoveDown={() => moveFile(index, "down")}
                    />
                  ))}

                  {/* Quick Add Button in Grid */}
                  <div
                    onClick={open}
                    className="aspect-3/4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-primary transition-all bg-neutral-50/30 dark:bg-neutral-900/30"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs font-medium">Add File</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        {files.length > 0 && (
          <div className="hidden lg:block lg:col-span-4 h-full min-h-0 overflow-hidden border-l border-neutral-200 dark:border-neutral-800">
            <PDFPreviewPanel file={selectedFile} pdf={selectedPdf} />
          </div>
        )}
      </div>
    </div>
  );
}

