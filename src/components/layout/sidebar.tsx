import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Layers, Scissors, LogOut, FileText, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "w-64 h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo Area - Minimalist */}
      <div className="h-20 flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-semibold text-neutral-900 dark:text-white">PDF Util</span>
        </Link>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col py-6">
        {/* Tools Section */}
        <div className="px-6 mb-2">
           <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Tools</p>
        </div>
        
        <nav className="space-y-1 px-3">
          <NavItem 
            icon={<Layers className="h-4 w-4" />} 
            label="Merge PDF" 
            to="/merge" 
            active={isActive("/merge")} 
          />
          <NavItem 
            icon={<Scissors className="h-4 w-4" />} 
            label="Split PDF" 
            to="/split" 
            active={isActive("/split")} 
          />
          <NavItem 
            icon={<LayoutGrid className="h-4 w-4" />} 
            label="Organizer" 
            to="/organize" 
            active={isActive("/organize")} 
          />
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto px-3 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-1">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Tool</span>
          </Link>
          <div className="px-3 py-2 text-[10px] font-medium text-neutral-400 uppercase tracking-widest flex items-center justify-between">
            <span>Version</span>
            <span>{__APP_VERSION__}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, to, active }: { icon: React.ReactNode, label: string, to: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        active 
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
          : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
