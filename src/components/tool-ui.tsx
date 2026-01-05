import { Download, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolEmptyStateProps {
  icon: any;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function ToolEmptyState({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}: ToolEmptyStateProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer min-h-[400px]",
        className,
      )}
    >
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center mb-6 shadow-sm">
        <Icon className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 text-center max-w-sm px-4">
        {description}
      </p>
    </div>
  );
}

interface DragOverlayProps {
  label?: string;
}

export function DragOverlay({
  label = "Drop files to add them",
}: DragOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-[1px] rounded-xl">
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 animate-in fade-in zoom-in-95">
        <Download className="h-8 w-8 text-primary animate-bounce" />
        <p className="font-semibold text-lg text-primary">{label}</p>
      </div>
    </div>
  );
}

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
