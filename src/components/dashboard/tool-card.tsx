import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: string;
  colorClass: string; // Tailwind class for icon bg/text color
  to: string;
}

export function ToolCard({
  icon,
  title,
  description,
  count,
  colorClass,
  to,
}: ToolCardProps) {
  return (
    <Link to={to} className="block group">
      <div className="bg-white dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-none hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300 relative overflow-hidden">
        {/* Hover Background Accent */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity rounded-bl-full -mr-10 -mt-10",
            colorClass.replace("bg-", "from-").replace("text-", "to-"),
          )}
        ></div>

        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
              colorClass,
            )}
          >
            {icon}
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-950 bg-neutral-900 dark:bg-neutral-700 text-white flex items-center justify-center text-[10px] font-bold">
              +9
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-400 mb-4">{description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-900">
            <span className="text-xs font-semibold text-neutral-400 bg-neutral-50 dark:bg-neutral-900 px-2 py-1 rounded-md">
              {count || "Tool"}
            </span>
            <div className="h-8 w-8 rounded-full border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
