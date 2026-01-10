import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolEmptyStateProps {
  icon: LucideIcon;
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
