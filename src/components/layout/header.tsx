import { useLocation, Link } from "react-router-dom";
import { Moon, Sun, ChevronRight, Home, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useToolHeader } from "@/hooks/use-tool-header";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { state } = useToolHeader();

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case "/merge":
        return "Merge PDF";
      case "/split":
        return "Split PDF";
      case "/organize":
        return "Organizer";
      default:
        return "Overview";
    }
  };

  const ActionIcon = state.action?.icon || Download;

  return (
    <header className="h-16 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Left: Breadcrumbs + Tool Desc */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs">
          <Link 
            to="/" 
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-300 dark:text-neutral-700" />
          <span className="font-medium text-neutral-900 dark:text-white">
            {getBreadcrumbTitle()}
          </span>
        </div>
        {state.description && (
          <p className="text-[10px] text-neutral-400 mt-0.5 font-medium leading-none">
            {state.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {state.action && (
          <Button
            size="sm"
            onClick={state.action.onClick}
            disabled={state.action.disabled || state.action.loading}
            className="gap-2 h-9 px-4 font-semibold shadow-sm"
          >
            {state.action.loading ? (
              state.action.loadingLabel || "Processing..."
            ) : (
              <>
                <ActionIcon className="h-4 w-4" />
                {state.action.label}
              </>
            )}
          </Button>
        )}

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg w-9 h-9 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}

