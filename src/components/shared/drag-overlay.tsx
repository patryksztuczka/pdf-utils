import { Download } from "lucide-react";

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
