import { FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedFileCardProps {
  file: File;
  onRemove: () => void;
  subtext?: string;
  isLoading?: boolean;
}

export function SelectedFileCard({
  file,
  onRemove,
  subtext,
  isLoading,
}: SelectedFileCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="truncate">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            {subtext || `${(file.size / 1024 / 1024).toFixed(2)} MB`}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 h-8 w-8 text-neutral-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
