import { Layers, Scissors, ArrowRight, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Dashboard() {
  return (
    <div className="w-full max-w-5xl space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl tracking-wide font-extrabold text-neutral-900 dark:text-white">
          Powerful PDF Tools <br className="hidden md:block" /> for Everyone
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
          Secure, client-side tools to manage your documents without uploading
          them anywhere.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <HomeToolCard
          to="/merge"
          title="Merge PDF"
          description="Combine multiple PDF files into one single document. Drag, drop, reorder."
          icon={<Layers className="h-8 w-8" />}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
        />
        <HomeToolCard
          to="/split"
          title="Split PDF"
          description="Extract pages or split a document into multiple separate files instantly."
          icon={<Scissors className="h-8 w-8" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
        />
        <HomeToolCard
          to="/organize"
          title="PDF Organizer"
          description="Group pages, reorder them, and extract parts of your document with ease."
          icon={<LayoutGrid className="h-8 w-8" />}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="text-center pt-8 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-sm text-neutral-400">
          No file limits • 100% Private
        </p>
      </div>
    </div>
  );
}

function HomeToolCard({ to, title, description, icon, colorClass }: any) {
  return (
    <Link
      to={to}
      className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-6 overflow-hidden"
    >
      <div
        className={cn(
          "h-20 w-20 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 duration-500",
          colorClass,
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white group-hover:gap-4 transition-all">
        Start Using <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
