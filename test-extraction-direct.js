const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testDirectExtraction() {
  try {
    console.log('Testing direct PDF extraction with pdf-parse...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Test PDF parsing directly
    console.log('Parsing PDF...');
    const data = await pdfParse(pdfBuffer, {
      normalizeWhitespace: false,
      // max: 2  // Test with limited pages first
    });
    
    console.log(`\nParsing successful!`);
    console.log(`- Pages: ${data.numpages}`);
    console.log(`- Text length: ${data.text.length} characters`);
    
    // Check for astrophysics content
    const text = data.text.toLowerCase();
    const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
    const foundTerms = astrophysicsTerms.filter(term => text.includes(term));
    
    console.log(`\nAstrophysics terms found: ${foundTerms.join(', ')}`);
    
    // Check for healthcare content (should be none)
    const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical condition', 'healthcare'];
    const foundHealthcareTerms = healthcareTerms.filter(term => text.includes(term));
    
    if (foundHealthcareTerms.length > 0) {
      console.log(`\n⚠️ WARNING: Found healthcare terms: ${foundHealthcareTerms.join(', ')}`);
    } else {
      console.log(`\n✅ No healthcare content found - extraction is working correctly!`);
    }
    
    // Show first 500 characters
    console.log(`\nFirst 500 characters of extracted text:`);
    console.log(data.text.substring(0, 500));
    
    console.log(`\n✅ Direct PDF extraction test completed successfully!`);
    
  } catch (error) {
    console.error('❌ Direct extraction test failed:', error.message);
    console.error(error.stack);
  }
}

testDirectExtraction();