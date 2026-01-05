import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from '@/lib/pdf-render';

export function usePDFDocument(file: File | null) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!file) {
      setPdf(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    getDocument(file)
      .then((doc) => {
        if (mounted) {
          setPdf(doc);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setPdf(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [file]);

  return { pdf, loading, error };
}
