import { useLocation, Link } from "react-router-dom";
import { Moon, Sun, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/merge":
        return "Merge PDF";
      case "/split":
        return "Split PDF";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link 
          to="/" 
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        {location.pathname !== "/" && (
          <>
            <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
            <span className="font-semibold text-neutral-900 dark:text-white">
              {getPageTitle()}
            </span>
          </>
        )}
        {location.pathname === "/" && (
          <>
             <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
             <span className="font-semibold text-neutral-900 dark:text-white">Overview</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-10 h-10 text-neutral-500 dark:text-neutral-400"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}

