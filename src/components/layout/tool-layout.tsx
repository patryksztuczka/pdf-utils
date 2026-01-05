import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface ToolLayoutProps {
  children: React.ReactNode;
}

export function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="h-screen w-screen bg-neutral-100 dark:bg-neutral-950 font-sans overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full ml-64">
        <Header />
        <main className="flex-1 p-6 min-h-0 overflow-hidden">
          <div className="w-full h-full bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 overflow-hidden flex flex-col">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
