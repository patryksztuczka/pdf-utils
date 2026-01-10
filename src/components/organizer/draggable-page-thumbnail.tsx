import type * as pdfjsLib from "pdfjs-dist";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PDFThumbnail } from "@/components/shared";

interface DraggablePageProps {
  page: number;
  pdf: pdfjsLib.PDFDocumentProxy | null;
  groupId: string;
  onSelect: () => void;
  onDownload: () => void;
  onUngroup?: () => void;
}

export function DraggablePageThumbnail({
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
        "relative w-full cursor-pointer group/thumb",
        isDragging && "opacity-40"
      )}
      onClick={onSelect}
    >
      <PDFThumbnail 
        pdf={pdf} 
        pageNumber={page} 
        scale={0.3} 
        className="w-full h-auto border-0 rounded-none shadow-none" 
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
