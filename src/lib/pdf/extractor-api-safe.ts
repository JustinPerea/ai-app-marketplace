/**
 * API-safe PDF extractor that avoids the pdf-parse test file issue
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

    // Use a process isolation approach to avoid pdf-parse's internal test file issues
    const { Worker } = await import('worker_threads');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    // Get the directory of this current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Create a simple worker script that runs pdf-parse in isolation
    const workerScript = `
      const { parentPort } = require('worker_threads');
      const pdfParse = require('pdf-parse');
      
      parentPort.on('message', async (pdfBuffer) => {
        try {
          const data = await pdfParse(Buffer.from(pdfBuffer), {
            normalizeWhitespace: false,
            max: 0, // No page limit
          });
          
          parentPort.postMessage({
            success: true,
            text: data.text,
            numpages: data.numpages,
            info: data.info
          });
        } catch (error) {
          parentPort.postMessage({
            success: false,
            error: error.message
          });
        }
      });
    `;

    // Create a temporary worker to run pdf-parse in isolation
    const workerCode = `
      const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
      
      if (isMainThread) {
        // This shouldn't happen, but just in case
        throw new Error('This should be run as a worker');
      } else {
        const pdfParse = require('pdf-parse');
        
        parentPort.on('message', async (pdfBuffer) => {
          try {
            const data = await pdfParse(Buffer.from(pdfBuffer), {
              normalizeWhitespace: false,
              max: 0,
            });
            
            parentPort.postMessage({
              success: true,
              text: data.text,
              numpages: data.numpages,
              info: data.info
            });
          } catch (error) {
            parentPort.postMessage({
              success: false,
              error: error.message
            });
          }
        });
      }
    `;

    return new Promise((resolve, reject) => {
      const worker = new Worker(workerCode, { eval: true });
      
      worker.postMessage(Array.from(pdfBuffer));
      
      worker.on('message', (result) => {
        worker.terminate();
        
        if (!result.success) {
          reject(new Error(`PDF extraction failed: ${result.error}`));
          return;
        }
        
        if (!result.text || result.text.trim().length === 0) {
          reject(new Error('PDF contains no extractable text - may be image-only or corrupted'));
          return;
        }

        // Clean and process the extracted text
        const processedText = cleanAndStructureText(result.text);
        
        // Analyze text structure
        const structure = analyzeTextStructure(processedText);

        // Prepare metadata
        const metadata = {
          pages: result.numpages,
          info: result.info,
          title: result.info?.Title || undefined,
          author: result.info?.Author || undefined,
          subject: result.info?.Subject || undefined,
          creator: result.info?.Creator || undefined,
          producer: result.info?.Producer || undefined,
          creationDate: result.info?.CreationDate ? new Date(result.info.CreationDate) : undefined,
          modificationDate: result.info?.ModDate ? new Date(result.info.ModDate) : undefined,
        };

        resolve({
          text: processedText,
          metadata,
          textLength: processedText.length,
          structure,
        });
      });
      
      worker.on('error', (error) => {
        worker.terminate();
        reject(new Error(`Worker error: ${error.message}`));
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        worker.terminate();
        reject(new Error('PDF extraction timeout'));
      }, 30000);
    });

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
    // Use the same worker approach for consistency
    const result = await extractTextFromPDF(pdfBuffer);
    return {
      pages: result.metadata.pages,
      size: pdfBuffer.length,
      hasText: result.text.trim().length > 0,
    };
  } catch (error) {
    throw new Error(`Failed to get PDF info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}