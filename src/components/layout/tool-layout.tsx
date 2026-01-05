import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface ToolLayoutProps {
  children: React.ReactNode;
}

export function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="h-screen w-screen bg-white dark:bg-neutral-950 font-sans overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full ml-64 min-w-0">
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
           {children}
        </main>
      </div>
    </div>
  );
}
