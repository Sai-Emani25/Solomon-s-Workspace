import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { ToolType } from '../types';

export interface ConversionResult {
  success: boolean;
  resultUrl?: string;
  fileName?: string;
  originalSize?: number;
  newSize?: number;
  error?: string;
  isRedirect?: boolean;
  redirectUrl?: string;
}

// External service URLs for document conversions
const EXTERNAL_SERVICES = {
  [ToolType.PPT_TO_PDF]: 'https://www.ilovepdf.com/powerpoint_to_pdf',
  [ToolType.PPT_TO_WORD]: 'https://cloudconvert.com/pptx-to-docx',
  [ToolType.PDF_TO_PPT]: 'https://www.ilovepdf.com/pdf_to_powerpoint',
  [ToolType.PDF_TO_WORD]: 'https://www.ilovepdf.com/pdf_to_word',
  [ToolType.VIDEO_COMPRESS]: 'https://www.freeconvert.com/video-compressor',
};

// Accepted file types for each tool
export const ACCEPTED_FILE_TYPES: Record<ToolType, string> = {
  [ToolType.PPT_TO_PDF]: '.pptx',
  [ToolType.PPT_TO_WORD]: '.ppt,.pptx',
  [ToolType.PDF_TO_PPT]: '.pdf',
  [ToolType.PDF_TO_WORD]: '.pdf',
  [ToolType.IMAGE_COMPRESS]: 'image/*',
  [ToolType.VIDEO_COMPRESS]: 'video/*',
};

// Tool descriptions
export const TOOL_DESCRIPTIONS: Record<ToolType, string> = {
  [ToolType.PPT_TO_PDF]: 'Convert PowerPoint presentations to PDF format.',
  [ToolType.PPT_TO_WORD]: 'Convert PowerPoint to Word documents.',
  [ToolType.PDF_TO_PPT]: 'Convert PDF files to PowerPoint presentations.',
  [ToolType.PDF_TO_WORD]: 'Convert PDF files to editable Word documents.',
  [ToolType.IMAGE_COMPRESS]: 'Compress images while maintaining quality.',
  [ToolType.VIDEO_COMPRESS]: 'Reduce video file size efficiently.',
};

/**
 * Compress an image file using browser-image-compression
 */
export async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  try {
    const options = {
      maxSizeMB: 1, // Max size of 1MB
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      onProgress: (progress: number) => {
        onProgress?.(progress);
      },
    };

    const originalSize = file.size;
    const compressedFile = await imageCompression(file, options);
    const newSize = compressedFile.size;

    // Create a download URL for the compressed image
    const resultUrl = URL.createObjectURL(compressedFile);

    // Generate filename
    const extension = file.name.split('.').pop() || 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}_compressed.${extension}`;

    return {
      success: true,
      resultUrl,
      fileName,
      originalSize,
      newSize,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compress image',
    };
  }
}

/**
 * Produces a PDF locally from a PPTX. Each slide is drawn to a canvas first, so
 * the PDF contains one raster page per slide and never uploads the presentation.
 * Old binary .ppt files cannot be read by browsers and are intentionally rejected.
 */
export async function convertPptxToPdf(file: File, onProgress?: (progress: number) => void): Promise<ConversionResult> {
  try {
    if (!file.name.toLowerCase().endsWith('.pptx')) throw new Error('Please use a .pptx file. Legacy .ppt files are not supported yet.');
    onProgress?.(5);
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path)).sort((a, b) => Number(a.match(/slide(\d+)/i)?.[1]) - Number(b.match(/slide(\d+)/i)?.[1]));
    if (!slidePaths.length) throw new Error('No slides were found in this presentation.');
    const pdf = await PDFDocument.create();

    for (let index = 0; index < slidePaths.length; index += 1) {
      const xml = await zip.file(slidePaths[index])!.async('text');
      const document = new DOMParser().parseFromString(xml, 'application/xml');
      const text = Array.from(document.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')).map((node) => node.textContent || '').filter(Boolean).join('\n');
      const canvas = documentToSlideCanvas(text, index + 1, slidePaths.length);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not render a slide.')), 'image/png'));
      const embedded = await pdf.embedPng(await png.arrayBuffer());
      const page = pdf.addPage([1280, 720]);
      page.drawImage(embedded, { x: 0, y: 0, width: 1280, height: 720 });
      onProgress?.(10 + ((index + 1) / slidePaths.length) * 85);
    }
    const bytes = await pdf.save();
    const baseName = file.name.replace(/\.pptx$/i, '');
    onProgress?.(100);
    return { success: true, resultUrl: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), fileName: `${baseName}.pdf`, originalSize: file.size, newSize: bytes.length };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to convert this presentation.' };
  }
}

const documentToSlideCanvas = (text: string, slideNumber: number, slideCount: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 1280; canvas.height = 720;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#312e81'; context.fillRect(0, 0, canvas.width, 18);
  context.fillStyle = '#111827'; context.font = 'bold 30px Arial';
  const lines = (text || 'This slide contains no readable text.').split(/\n+/).flatMap((line) => wrapCanvasText(context, line, 1080));
  lines.slice(0, 18).forEach((line, i) => context.fillText(line, 100, 100 + i * 32));
  context.fillStyle = '#64748b'; context.font = '18px Arial'; context.fillText(`${slideNumber} / ${slideCount}`, 1120, 680);
  return canvas;
};

const wrapCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.trim().split(/\s+/); const lines: string[] = []; let line = '';
  words.forEach((word) => { const next = line ? `${line} ${word}` : word; if (context.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; });
  if (line) lines.push(line); return lines;
};

/**
 * Check if a tool requires external service
 */
export function requiresExternalService(toolType: ToolType): boolean {
  return toolType in EXTERNAL_SERVICES && toolType !== ToolType.PPT_TO_PDF;
}

/**
 * Get the external service URL for a tool
 */
export function getExternalServiceUrl(toolType: ToolType): string | null {
  return EXTERNAL_SERVICES[toolType as keyof typeof EXTERNAL_SERVICES] || null;
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate compression percentage
 */
export function calculateCompressionPercent(originalSize: number, newSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - newSize) / originalSize) * 100);
}
