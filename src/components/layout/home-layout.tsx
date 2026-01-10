import { Link } from "react-router-dom";
import { FileText, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans flex flex-col">
      <header className="h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-8 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-neutral-900 dark:text-white">
            PDF Utils
          </span>
        </Link>
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
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
