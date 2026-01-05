import { useEffect, useState } from 'react';
import { renderPageToDataURL } from '@/lib/pdf-render';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  pdf: PDFDocumentProxy | null;
  pageNumber?: number;
  scale?: number;
  className?: string;
}

export function PDFThumbnail({ pdf, pageNumber = 1, scale = 0.5, className }: PDFThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdf) return;

    let mounted = true;
    setLoading(true);

    renderPageToDataURL(pdf, pageNumber, scale)
      .then((url) => {
        if (mounted) setImageUrl(url);
      })
      .catch((err) => console.error("Error rendering thumbnail", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pdf, pageNumber, scale]);

  if (!pdf || loading || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 ${className}`}>
        <FileText className="text-neutral-400 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ${className}`}>
      <img src={imageUrl} alt={`Page ${pageNumber}`} className="w-full h-full object-contain" />
    </div>
  );
}
