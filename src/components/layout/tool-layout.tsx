import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  children: React.ReactNode;
}

export function ToolLayout({ children }: ToolLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-screen bg-white dark:bg-neutral-950 font-sans overflow-hidden flex relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "flex-1 flex flex-col h-full min-w-0 transition-all duration-300",
        !isMobile && "ml-64"
      )}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
           {children}
        </main>
      </div>
    </div>
  );
}
