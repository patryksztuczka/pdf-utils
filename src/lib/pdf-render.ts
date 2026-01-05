import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
// We use the CDN for simplicity in this dev environment to avoid complex build config for the worker file
// In a production app you might bundle the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function getDocument(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return pdfjsLib.getDocument(arrayBuffer).promise;
}

export async function renderPageToDataURL(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;

  return canvas.toDataURL();
}
