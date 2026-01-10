import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HomeToolCardProps {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  colorClass: string;
  className?: string;
}

export function HomeToolCard({
  to,
  title,
  description,
  icon,
  colorClass,
  className,
}: HomeToolCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-6 overflow-hidden",
        className,
      )}
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
