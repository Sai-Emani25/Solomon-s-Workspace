import imageCompression from 'browser-image-compression';
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
  [ToolType.PPT_TO_PDF]: '.ppt,.pptx',
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
 * Check if a tool requires external service
 */
export function requiresExternalService(toolType: ToolType): boolean {
  return toolType in EXTERNAL_SERVICES;
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
