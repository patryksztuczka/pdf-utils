import { Link } from "react-router-dom";
import { Moon, Sun, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/logo-light.webp";
import logoDark from "@/assets/logo-dark.webp";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans flex flex-col">
      <header className="h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-8 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={theme === "light" ? logoLight : logoDark}
            alt="PDF Util"
            className="h-10 w-auto rounded-md shadow-sm border border-neutral-100 dark:border-neutral-800"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full w-10 h-10 text-neutral-500 dark:text-neutral-400"
          >
            <a
              href="https://github.com/patryksztuczka/pdf-utils"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
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
      <footer className="py-6 px-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-400 font-medium">
        <p>© {new Date().getFullYear()} PDF Utils</p>
        <p>v{__APP_VERSION__}</p>
      </footer>
    </div>
  );
}
