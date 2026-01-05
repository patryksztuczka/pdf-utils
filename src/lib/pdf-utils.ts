import { PDFDocument } from 'pdf-lib';

/**
 * Merges multiple PDF files into a single PDF.
 * @param files Array of File objects representing PDF files.
 * @returns A Promise that resolves to the merged PDF as a Uint8Array.
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Gets the total page count of a PDF file.
 * @param file A File object representing a PDF.
 * @returns A Promise that resolves to the page count.
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}

/**
 * Splits a PDF file into multiple separate PDFs based on split page numbers.
 * The split occurs AFTER the specified page numbers.
 * @param file The PDF file to split.
 * @param splitPages Array of page numbers after which to split (1-based index).
 * @returns A Promise that resolves to an array containing Uint8Arrays (the resulting PDFs).
 */
export async function splitPDF(file: File, splitPages: number[]): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();

  // Validate and sort split pages
  const uniqueSplitPages = [...new Set(splitPages)]
    .sort((a, b) => a - b)
    .filter(page => page >= 1 && page < totalPages);

  if (uniqueSplitPages.length === 0) {
    throw new Error(`No valid split pages provided. Must be between 1 and ${totalPages - 1}.`);
  }

  const resultPdfs: Uint8Array[] = [];
  
  // Calculate segments: [start, end] (inclusive 0-based indices)
  // Example: Split after 2 (index 1). Part 1: 0-1. Part 2: 2-End.
  let startIndex = 0;

  for (const splitPage of uniqueSplitPages) {
    // splitPage is 1-based "split after".
    // If split after page 2, the last index of this part is index 1 (page 2).
    // The loop logic:
    // Page 2 (index 1) -> Indices to copy: startIndex (0) to splitPage (2). Wait, slice is exclusive?
    // Let's use explicit indices array.
    
    // Split after page X (1-based).
    // Indices for this segment: startIndex ... (X - 1)
    
    // Example: Total 5. Split after 2.
    // Part 1: Pages 1, 2. Indices 0, 1.
    // startIndex = 0. EndIndex (exclusive) = 2.
    
    // actually, simple logic:
    // Indices to copy are from `startIndex` up to `splitPage - 1`.
    
    const indicesToCopy: number[] = [];
    for (let i = startIndex; i < splitPage; i++) {
      indicesToCopy.push(i);
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);
    copiedPages.forEach((page) => newPdf.addPage(page));
    resultPdfs.push(await newPdf.save());

    startIndex = splitPage;
  }

  // Final segment: startIndex to totalPages - 1
  const finalIndices: number[] = [];
  for (let i = startIndex; i < totalPages; i++) {
    finalIndices.push(i);
  }
  
  if (finalIndices.length > 0) {
    const finalPdf = await PDFDocument.create();
    const finalCopiedPages = await finalPdf.copyPages(sourcePdf, finalIndices);
    finalCopiedPages.forEach((page) => finalPdf.addPage(page));
    resultPdfs.push(await finalPdf.save());
  }

  return resultPdfs;
}

/**
 * Extracts specific pages from a PDF file.
 * @param file The PDF file.
 * @param pageIndices Array of 0-based page indices to extract.
 * @returns A Promise that resolves to the new PDF as a Uint8Array.
 */
export async function extractPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  return await newPdf.save();
}
