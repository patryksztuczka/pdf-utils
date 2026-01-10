import { useLocation, Link } from "react-router-dom";
import {
  Moon,
  Sun,
  ChevronRight,
  Home,
  Download,
  Menu,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useToolHeader } from "@/hooks/use-tool-header";
import logoLight from "@/assets/logo-light.webp";
import logoDark from "@/assets/logo-dark.webp";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
    <header className="h-20 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Left: Breadcrumbs + Tool Desc */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2 h-9 w-9 text-neutral-500"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <img
            src={theme === "light" ? logoLight : logoDark}
            alt="PDF Util"
            className="h-10 w-auto rounded-xl shadow-md border border-neutral-100 dark:border-neutral-800"
          />
        </Link>

        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block lg:hidden" />

        <div className="flex flex-col pt-1">
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
            <p className="text-xs text-neutral-400 mt-1.5 font-medium leading-none">
              {state.description}
            </p>
          )}
        </div>
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
          asChild
          className="rounded-lg w-9 h-9 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <a
            href="https://github.com/patryksztuczka/pdf-utils"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-4 w-4" />
          </a>
        </Button>

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
