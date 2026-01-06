import { usePDFDocument } from "@/hooks/use-pdf";
import { PDFThumbnail } from "@/components/pdf-thumbnail";
import { Button } from "@/components/ui/button";
import { X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MergeFileItemProps {
  file: File;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function MergeFileItem({
  file,
  index,
  total,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: MergeFileItemProps) {
  const { pdf, loading } = usePDFDocument(file);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-3 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700",
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "relative w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800",
        loading && "aspect-[1/1.414]"
      )}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <PDFThumbnail
            pdf={pdf}
            className="w-full h-auto border-none rounded-none"
            scale={0.4}
          />
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="h-8 w-8 rounded-full"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === total - 1}
            className="h-8 w-8 rounded-full"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Index Badge */}
        <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/60 text-white text-xs font-medium flex items-center justify-center backdrop-blur-sm">
          {index + 1}
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-neutral-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
}
