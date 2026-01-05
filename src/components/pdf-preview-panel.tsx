import { useEffect, useState, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { renderPageToDataURL } from "@/lib/pdf-render";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PDFPreviewPanelProps {
  file: File;
  pdf: PDFDocumentProxy | null;
  splitPoints?: number[]; // Page numbers after which a split occurs
  scrollToPage?: { page: number; timestamp: number } | null; // Page to scroll to
}

export function PDFPreviewPanel({
  file,
  pdf,
  splitPoints = [],
  scrollToPage,
}: PDFPreviewPanelProps) {
  const [pageImages, setPageImages] = useState<{ [page: number]: string }>({});
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdf) {
      setPageImages({});
      renderedPagesRef.current.clear();
      return;
    }

    // Reset scroll when file changes
    if (containerRef.current && renderedPagesRef.current.size === 0) {
      containerRef.current.scrollTop = 0;
    }

    let active = true;
    setLoading(true);

    const renderAllPages = async () => {
      const totalPages = pdf.numPages;
      const pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);

      // If we have a scrollToPage, prioritize it and its neighbors
      const targetPage = scrollToPage?.page;
      if (targetPage) {
        const index = pagesToRender.indexOf(targetPage);
        if (index > -1) {
          // Move requested page and a few surrounding ones to the front
          const radius = 2;
          const start = Math.max(0, index - radius);
          const count = Math.min(pagesToRender.length - start, radius * 2 + 1);
          const neighbors = pagesToRender.splice(start, count);
          pagesToRender.unshift(...neighbors);
        }
      }

      // Render pages sequentially
      for (const i of pagesToRender) {
        if (!active) break;
        if (renderedPagesRef.current.has(i)) continue; // Skip if already rendered

        try {
          const url = await renderPageToDataURL(pdf, i, 0.6);
          if (active) {
            renderedPagesRef.current.add(i);
            setPageImages((prev) => ({ ...prev, [i]: url }));
          }
        } catch (e) {
          console.error(`Failed to render page ${i}`, e);
        }
      }
      if (active) setLoading(false);
    };

    renderAllPages();

    return () => {
      active = false;
    };
  }, [pdf, scrollToPage?.timestamp, scrollToPage?.page]); 

  // Handle scroll to page
  useEffect(() => {
    const targetPage = scrollToPage?.page;
    if (targetPage && containerRef.current) {
      const pageElement = document.getElementById(
        `pdf-preview-page-${targetPage}`,
      );
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect
        pageElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          pageElement.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    }
  }, [scrollToPage?.timestamp, scrollToPage?.page]);


  return (
    <div className="h-full flex flex-col bg-neutral-50/50 dark:bg-neutral-900/50">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 truncate">Preview: {file.name}</h3>
        <p className="text-[10px] text-neutral-400 mt-0.5">{pdf?.numPages || 0} pages</p>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {loading && Object.keys(pageImages).length === 0 && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        )}

        {pdf &&
          Array.from({ length: pdf.numPages }, (_, i) => i + 1).map((page) => (
            <div
              key={page}
              id={`pdf-preview-page-${page}`}
              className="relative group transition-all duration-300 rounded-lg"
            >
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-xs font-medium text-neutral-400">
                  Page {page}
                </span>
              </div>

              <div
                className={cn(
                  "rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black shadow-sm transition-shadow hover:shadow-md w-full relative",
                  "aspect-[1/1.414]", // A4 aspect ratio
                  !pageImages[page] &&
                    "flex items-center justify-center bg-neutral-100 dark:bg-neutral-800",
                )}
              >
                {pageImages[page] ? (
                  <img
                    src={pageImages[page]}
                    alt={`Page ${page}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                )}
              </div>

              {/* Split Line Indicator */}
              {splitPoints.includes(page) && (
                <div className="absolute -bottom-4 left-0 right-0 flex items-center gap-2 z-10">
                  <div className="h-0.5 flex-1 bg-red-500 shadow-sm"></div>
                  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    SPLIT
                  </div>
                  <div className="h-0.5 flex-1 bg-red-500 shadow-sm"></div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
