/**
 * Text processing utilities for PDF content
 * Handles chunking, preprocessing, and formatting
 */

export interface TextChunk {
  content: string;
  index: number;
  tokens: number;
  metadata: {
    hasHeadings: boolean;
    hasLists: boolean;
    startLine: number;
    endLine: number;
  };
}

export interface ChunkingOptions {
  maxTokens: number;
  overlap: number;
  preserveStructure: boolean;
  model: string;
}

/**
 * Estimate token count for different models
 */
export function estimateTokens(text: string, model: string): number {
  // Rough estimation based on model type
  const baseRatio = 4; // ~4 characters per token for most models
  
  let ratio = baseRatio;
  
  if (model.includes('gpt-4')) {
    ratio = 3.8; // GPT-4 is slightly more efficient
  } else if (model.includes('claude')) {
    ratio = 4.2; // Claude tends to use more tokens
  } else if (model.includes('gemini')) {
    ratio = 4.0; // Google models are middle ground
  } else if (model.includes('llama')) {
    ratio = 4.5; // Llama models tend to use more tokens
  }
  
  return Math.ceil(text.length / ratio);
}

/**
 * Split text into manageable chunks for AI processing
 */
export function chunkText(text: string, options: ChunkingOptions): TextChunk[] {
  const { maxTokens, overlap, preserveStructure } = options;
  
  // If text is small enough, return as single chunk
  const totalTokens = estimateTokens(text, options.model);
  if (totalTokens <= maxTokens) {
    return [{
      content: text,
      index: 0,
      tokens: totalTokens,
      metadata: {
        hasHeadings: analyzeStructure(text).hasHeadings,
        hasLists: analyzeStructure(text).hasLists,
        startLine: 0,
        endLine: text.split('\n').length - 1,
      }
    }];
  }

  const chunks: TextChunk[] = [];
  const lines = text.split('\n');
  
  if (preserveStructure) {
    return chunkByStructure(lines, options);
  } else {
    return chunkBySize(lines, options);
  }
}

/**
 * Chunk text while preserving document structure (sections, paragraphs)
 */
function chunkByStructure(lines: string[], options: ChunkingOptions): TextChunk[] {
  const chunks: TextChunk[] = [];
  const { maxTokens, overlap } = options;
  
  let currentChunk: string[] = [];
  let currentTokens = 0;
  let chunkIndex = 0;
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTokens = estimateTokens(line, options.model);
    
    // Check if this line starts a new section
    const isNewSection = isStructuralBreak(line, lines[i - 1]);
    
    // If adding this line would exceed limit and we have content, finalize chunk
    if (currentTokens + lineTokens > maxTokens && currentChunk.length > 0) {
      // Create chunk
      const chunkContent = currentChunk.join('\n').trim();
      if (chunkContent) {
        chunks.push({
          content: chunkContent,
          index: chunkIndex++,
          tokens: currentTokens,
          metadata: {
            hasHeadings: analyzeStructure(chunkContent).hasHeadings,
            hasLists: analyzeStructure(chunkContent).hasLists,
            startLine,
            endLine: startLine + currentChunk.length - 1,
          }
        });
      }
      
      // Start new chunk with overlap
      if (overlap > 0 && chunks.length > 0) {
        const overlapLines = Math.min(overlap, currentChunk.length);
        currentChunk = currentChunk.slice(-overlapLines);
        currentTokens = estimateTokens(currentChunk.join('\n'), options.model);
        startLine = startLine + currentChunk.length - overlapLines;
      } else {
        currentChunk = [];
        currentTokens = 0;
        startLine = i;
      }
    }
    
    currentChunk.push(line);
    currentTokens += lineTokens;
  }
  
  // Add final chunk
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join('\n').trim();
    if (chunkContent) {
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        tokens: currentTokens,
        metadata: {
          hasHeadings: analyzeStructure(chunkContent).hasHeadings,
          hasLists: analyzeStructure(chunkContent).hasLists,
          startLine,
          endLine: startLine + currentChunk.length - 1,
        }
      });
    }
  }
  
  return chunks;
}

/**
 * Chunk text by size without considering structure
 */
function chunkBySize(lines: string[], options: ChunkingOptions): TextChunk[] {
  const chunks: TextChunk[] = [];
  const { maxTokens, overlap } = options;
  
  let currentChunk: string[] = [];
  let currentTokens = 0;
  let chunkIndex = 0;
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTokens = estimateTokens(line, options.model);
    
    // If adding this line would exceed limit, finalize chunk
    if (currentTokens + lineTokens > maxTokens && currentChunk.length > 0) {
      const chunkContent = currentChunk.join('\n').trim();
      if (chunkContent) {
        chunks.push({
          content: chunkContent,
          index: chunkIndex++,
          tokens: currentTokens,
          metadata: {
            hasHeadings: analyzeStructure(chunkContent).hasHeadings,
            hasLists: analyzeStructure(chunkContent).hasLists,
            startLine,
            endLine: startLine + currentChunk.length - 1,
          }
        });
      }
      
      // Start new chunk with overlap
      if (overlap > 0) {
        const overlapLines = Math.min(overlap, currentChunk.length);
        currentChunk = currentChunk.slice(-overlapLines);
        currentTokens = estimateTokens(currentChunk.join('\n'), options.model);
        startLine = i - overlapLines;
      } else {
        currentChunk = [];
        currentTokens = 0;
        startLine = i;
      }
    }
    
    currentChunk.push(line);
    currentTokens += lineTokens;
  }
  
  // Add final chunk
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join('\n').trim();
    if (chunkContent) {
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        tokens: currentTokens,
        metadata: {
          hasHeadings: analyzeStructure(chunkContent).hasHeadings,
          hasLists: analyzeStructure(chunkContent).hasLists,
          startLine,
          endLine: startLine + currentChunk.length - 1,
        }
      });
    }
  }
  
  return chunks;
}

/**
 * Check if a line represents a structural break (new section, heading, etc.)
 */
function isStructuralBreak(currentLine: string, previousLine?: string): boolean {
  const trimmed = currentLine.trim();
  
  // Empty line followed by content
  if (!previousLine?.trim() && trimmed) {
    return true;
  }
  
  // Markdown headers
  if (/^#{1,6}\s/.test(trimmed)) {
    return true;
  }
  
  // All caps headers (common in academic papers)
  if (/^[A-Z][A-Z\s]{5,}$/.test(trimmed)) {
    return true;
  }
  
  // Lines ending with colon (section headers)
  if (/^[^.!?]*:\s*$/.test(trimmed) && trimmed.length < 60) {
    return true;
  }
  
  // Numbered sections
  if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Analyze text structure
 */
function analyzeStructure(text: string): { hasHeadings: boolean; hasLists: boolean } {
  return {
    hasHeadings: /^#{1,6}\s/m.test(text) || 
                 /^[A-Z][A-Z\s]{5,}$/m.test(text) ||
                 /^[^.!?]*:\s*$/m.test(text),
    hasLists: /^\s*[•\-\*]\s/m.test(text) || 
              /^\s*\d+\.\s/m.test(text),
  };
}

/**
 * Preprocess text to clean common extraction artifacts
 */
export function preprocessText(text: string): string {
  return text
    // Fix hyphenated words split across lines
    .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
    // Remove header/footer artifacts (page numbers, repeated headers)
    .replace(/\n\s*\d+\s*\n/g, '\n\n') // Standalone page numbers
    .replace(/\n\s*Page\s+\d+\s*\n/gi, '\n\n')
    // Clean up reference artifacts
    .replace(/\[\d+\]/g, '') // Remove reference numbers
    .replace(/\(\s*\d{4}\s*\)/g, '($1)') // Clean up years in parentheses
    // Fix spacing around punctuation
    .replace(/\s+([.!?,:;])/g, '$1')
    .replace(/([.!?])\s*\n\s*([a-z])/g, '$1 $2')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Post-process AI-generated notes for better formatting
 */
export function postprocessNotes(notes: string): string {
  return notes
    // Ensure proper markdown formatting
    .replace(/^([A-Z][A-Z\s]{3,})$/gm, '## $1')
    .replace(/^(\d+\.\s+[A-Z].*):$/gm, '### $1')
    // Fix bullet points
    .replace(/^[-*]\s+/gm, '• ')
    // Ensure proper spacing around headers
    .replace(/^(#{1,6}\s+.*$)/gm, '\n$1\n')
    // Clean up excessive line breaks
    .replace(/\n{4,}/g, '\n\n\n')
    // Ensure proper paragraph spacing
    .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
    .trim();
}

/**
 * Combine notes from multiple chunks into a coherent document
 */
export function combineChunkNotes(chunkNotes: { content: string; index: number }[]): string {
  // Sort by index to ensure proper order
  const sortedNotes = chunkNotes.sort((a, b) => a.index - b.index);
  
  // Combine notes with section separators
  const combined = sortedNotes
    .map((note, index) => {
      const content = note.content.trim();
      if (index === 0) return content;
      
      // Add section separator for multi-chunk documents
      return `\n---\n\n${content}`;
    })
    .join('');
  
  return postprocessNotes(combined);
}