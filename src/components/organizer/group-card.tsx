import type * as pdfjsLib from "pdfjs-dist";
import { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DraggablePageThumbnail } from "./draggable-page-thumbnail";

interface PageGroup {
  id: string;
  pages: number[];
}

interface GroupCardProps {
  group: PageGroup;
  pdf: pdfjsLib.PDFDocumentProxy | null;
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

export function GroupCard({
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
      <div className="relative w-full">
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
