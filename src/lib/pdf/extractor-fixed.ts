/**
 * Fixed PDF extractor that works around pdf-parse module issues
 */

export interface PDFExtractionResult {
  text: string;
  metadata: {
    pages: number;
    info?: any;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  textLength: number;
  structure: {
    hasHeadings: boolean;
    hasLists: boolean;
    hasTables: boolean;
    paragraphCount: number;
  };
}

/**
 * Extract text from PDF buffer with enhanced processing
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    // Validate buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Invalid PDF buffer: empty or null');
    }

    // Check if buffer starts with PDF signature
    if (!pdfBuffer.toString('latin1', 0, 4).startsWith('%PDF')) {
      throw new Error('Invalid PDF format: missing PDF signature');
    }

    let data;
    try {
      // Try multiple import methods for pdf-parse
      let pdfParse;
      try {
        // First try direct import
        pdfParse = require('pdf-parse');
      } catch (firstError) {
        try {
          // Try importing from lib subdirectory
          pdfParse = require('pdf-parse/lib/pdf-parse.js');
        } catch (secondError) {
          // Try dynamic import
          const pdfParseModule = await import('pdf-parse');
          pdfParse = pdfParseModule.default || pdfParseModule;
        }
      }
      
      // Parse PDF with the library
      data = await pdfParse(pdfBuffer, {
        // Preserve whitespace and line breaks for better structure
        normalizeWhitespace: false,
        // Extract text from all pages for full content
        // max: 2, // Removed page limit to process complete documents
      });
      
      console.log(`PDF parsing successful: ${data.numpages} pages, ${data.text.length} characters extracted`);
      
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError.message);
      console.error('Parse error details:', parseError);
      
      // Don't use fallback mock data - throw proper error
      throw new Error(`Failed to extract text from PDF: ${parseError.message}. Please ensure the PDF is not corrupted or password-protected.`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text - may be image-only or corrupted');
    }

    // Clean and process the extracted text
    const processedText = cleanAndStructureText(data.text);
    
    // Analyze text structure
    const structure = analyzeTextStructure(processedText);

    // Prepare metadata
    const metadata = {
      pages: data.numpages,
      info: data.info,
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      subject: data.info?.Subject || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
      creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
    };

    return {
      text: processedText,
      metadata,
      textLength: processedText.length,
      structure,
    };

  } catch (error) {
    if (error instanceof Error) {
      // Enhance error message with more context
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('PDF file is corrupted or not a valid PDF format');
      }
      if (error.message.includes('Password')) {
        throw new Error('PDF is password protected - please provide an unlocked version');
      }
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred during PDF processing');
  }
}

/**
 * Clean and structure extracted text
 */
function cleanAndStructureText(rawText: string): string {
  // Remove excessive whitespace but preserve structure
  let text = rawText
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines (more than 2)
    .replace(/\n{4,}/g, '\n\n\n')
    // Clean up scattered single characters on their own lines
    .replace(/\n\s*[a-zA-Z]\s*\n/g, ' ')
    // Fix common OCR/extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase-uppercase
    .replace(/([.!?])([A-Z])/g, '$1 $2') // Add space after punctuation
    // Clean up multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Clean up space before punctuation
    .replace(/\s+([.!?,:;])/g, '$1')
    // Fix common formatting issues
    .replace(/\n\s*[-•]\s*/g, '\n• ') // Normalize bullet points
    .replace(/\n\s*\d+\.\s*/g, '\n$&') // Preserve numbered lists
    // Preserve section headers (lines that end with colons or are in all caps)
    .replace(/\n([A-Z][A-Z\s]{2,})\n/g, '\n\n## $1\n\n')
    .replace(/\n([^.!?]*:)\s*\n/g, '\n\n### $1\n')
    // Trim final result
    .trim();

  // Ensure document doesn't start/end with excessive whitespace
  return text;
}

/**
 * Analyze the structure of extracted text
 */
function analyzeTextStructure(text: string): PDFExtractionResult['structure'] {
  const lines = text.split('\n');
  
  return {
    hasHeadings: /^#{1,6}\s/.test(text) || 
                 /^[A-Z][A-Z\s]{5,}$/m.test(text) ||
                 /\n[^.\n]{1,50}:\s*\n/.test(text),
    hasLists: /^\s*[•\-\*]\s/m.test(text) || 
              /^\s*\d+\.\s/m.test(text),
    hasTables: /\|.*\|/.test(text) || 
               /\t.*\t/.test(text) ||
               /\s{4,}\S+\s{4,}\S+/.test(text),
    paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 50).length,
  };
}

/**
 * Validate PDF file before processing
 */
export function validatePDF(buffer: Buffer): { isValid: boolean; error?: string } {
  try {
    if (!buffer || buffer.length === 0) {
      return { isValid: false, error: 'Empty file provided' };
    }

    if (buffer.length < 8) {
      return { isValid: false, error: 'File too small to be a valid PDF' };
    }

    // Check PDF signature
    const header = buffer.toString('latin1', 0, 8);
    if (!header.startsWith('%PDF-')) {
      return { isValid: false, error: 'Invalid PDF format - missing PDF signature' };
    }

    // Check if it's a reasonable size (not too large)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      return { isValid: false, error: 'PDF file too large (maximum 50MB allowed)' };
    }

    return { isValid: true };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Get PDF file information without full text extraction
 */
export async function getPDFInfo(pdfBuffer: Buffer): Promise<{ pages: number; size: number; hasText: boolean }> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(pdfBuffer, { max: 1 }); // Only parse first page for info
    
    return {
      pages: data.numpages,
      size: pdfBuffer.length,
      hasText: data.text.trim().length > 0,
    };
  } catch (error) {
    throw new Error(`Failed to get PDF info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}