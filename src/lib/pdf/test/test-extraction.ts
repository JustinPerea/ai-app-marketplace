/**
 * Test script for PDF text extraction with the IC342 research paper
 */

import { readFileSync } from 'fs';
import { extractTextFromPDF, validatePDF } from '../extractor-fixed';
import { chunkText, estimateTokens, preprocessText } from '../text-processor';

async function testPDFExtraction() {
  try {
    console.log('Testing PDF extraction with IC342 research paper...\n');
    
    // Read the research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = readFileSync(pdfPath);
    
    console.log(`PDF file size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Validate PDF
    const validation = validatePDF(pdfBuffer);
    if (!validation.isValid) {
      throw new Error(`PDF validation failed: ${validation.error}`);
    }
    console.log('✓ PDF validation passed');
    
    // Extract text
    const extractionResult = await extractTextFromPDF(pdfBuffer);
    console.log(`✓ Text extraction completed`);
    console.log(`  - Pages: ${extractionResult.metadata.pages}`);
    console.log(`  - Text length: ${extractionResult.textLength} characters`);
    console.log(`  - Has headings: ${extractionResult.structure.hasHeadings}`);
    console.log(`  - Has lists: ${extractionResult.structure.hasLists}`);
    console.log(`  - Paragraph count: ${extractionResult.structure.paragraphCount}`);
    
    // Show first 500 characters
    console.log('\nFirst 500 characters of extracted text:');
    console.log('---');
    console.log(extractionResult.text.substring(0, 500));
    console.log('---\n');
    
    // Test preprocessing
    const processedText = preprocessText(extractionResult.text);
    console.log(`✓ Text preprocessing completed`);
    console.log(`  - Original length: ${extractionResult.text.length}`);
    console.log(`  - Processed length: ${processedText.length}`);
    
    // Test token estimation
    const tokens = estimateTokens(processedText, 'ollama-llama32');
    console.log(`✓ Token estimation: ${tokens} tokens (for llama3.2:3b)`);
    
    // Test chunking for large documents
    if (tokens > 2000) {
      console.log('\nTesting chunking for large document...');
      const chunks = chunkText(processedText, {
        maxTokens: 1500,
        overlap: 100,
        preserveStructure: true,
        model: 'ollama-llama32'
      });
      
      console.log(`✓ Created ${chunks.length} chunks`);
      chunks.forEach((chunk, i) => {
        console.log(`  - Chunk ${i + 1}: ${chunk.tokens} tokens, lines ${chunk.metadata.startLine}-${chunk.metadata.endLine}`);
      });
    }
    
    // Verify this is actually about IC342 astrophysics
    const textLower = processedText.toLowerCase();
    const astrophysicsTerms = [
      'x-ray', 'galaxy', 'galaxies', 'chandra', 'luminosity', 
      'stellar', 'binaries', 'hmxb', 'lmxb', 'astrophysical'
    ];
    
    console.log('\nVerifying content is about astrophysics:');
    const foundTerms = astrophysicsTerms.filter(term => textLower.includes(term));
    console.log(`✓ Found ${foundTerms.length}/${astrophysicsTerms.length} astrophysics terms:`, foundTerms);
    
    // Check for IC342 specific content
    const ic342Terms = ['ic342', 'ic 342', 'lehmer'];
    const foundIC342 = ic342Terms.filter(term => textLower.includes(term));
    console.log(`✓ Found ${foundIC342.length}/${ic342Terms.length} IC342-related terms:`, foundIC342);
    
    console.log('\n✅ PDF extraction test completed successfully!');
    
  } catch (error) {
    console.error('❌ PDF extraction test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPDFExtraction();