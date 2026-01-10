import { Layers, Scissors, LayoutGrid } from "lucide-react";
import { HomeToolCard } from "./home-tool-card";

export function LandingPage() {
  return (
    <div className="w-full max-w-5xl space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl tracking-wide font-extrabold text-neutral-900 dark:text-white animate-fade-in-down">
          Powerful PDF Tools <br className="hidden md:block" /> for Everyone
        </h1>
        <p className="text-xl text-neutral-500 max-w-2xl mx-auto animate-fade-in-down [animation-delay:100ms]">
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
          className="animate-fade-in-up [animation-delay:200ms]"
        />
        <HomeToolCard
          to="/split"
          title="Split PDF"
          description="Extract pages or split a document into multiple separate files instantly."
          icon={<Scissors className="h-8 w-8" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
          className="animate-fade-in-up [animation-delay:300ms]"
        />
        <HomeToolCard
          to="/organize"
          title="PDF Organizer"
          description="Group pages, reorder them, and extract parts of your document with ease."
          icon={<LayoutGrid className="h-8 w-8" />}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
          className="animate-fade-in-up [animation-delay:400ms]"
        />
      </div>
    </div>
  );
}
