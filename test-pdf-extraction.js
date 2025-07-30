const fs = require('fs');
const path = require('path');

// Import the extraction function
const { extractTextFromPDF } = require('./src/lib/pdf/extractor-fixed.ts');

async function testPDFExtraction() {
  try {
    console.log('Testing PDF extraction with IC342 research paper...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Extract text
    const result = await extractTextFromPDF(pdfBuffer);
    
    console.log(`\nExtraction Results:`);
    console.log(`- Pages: ${result.metadata.pages}`);
    console.log(`- Text length: ${result.textLength} characters`);
    console.log(`- Title: ${result.metadata.title || 'Not available'}`);
    console.log(`- Author: ${result.metadata.author || 'Not available'}`);
    
    // Check for astrophysics-related content
    const text = result.text.toLowerCase();
    const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
    const foundTerms = astrophysicsTerms.filter(term => text.includes(term));
    
    console.log(`\nAstrophysics terms found: ${foundTerms.join(', ')}`);
    
    // Show first 500 characters of extracted text
    console.log(`\nFirst 500 characters of extracted text:`);
    console.log(result.text.substring(0, 500));
    
    // Check if we have healthcare content (should be none)
    const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical', 'healthcare'];
    const foundHealthcareTerms = healthcareTerms.filter(term => text.includes(term));
    
    if (foundHealthcareTerms.length > 0) {
      console.log(`\n⚠️ WARNING: Found healthcare terms: ${foundHealthcareTerms.join(', ')}`);
    } else {
      console.log(`\n✅ No healthcare content found - extraction is working correctly!`);
    }
    
    console.log(`\n✅ PDF extraction test completed successfully!`);
    
  } catch (error) {
    console.error('❌ PDF extraction test failed:', error.message);
    console.error(error.stack);
  }
}

testPDFExtraction();