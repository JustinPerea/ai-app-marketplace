import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Since we can't easily import TypeScript from Node.js, let's test the API endpoint instead
async function testPDFExtractionAPI() {
  try {
    console.log('Testing PDF extraction API with IC342 research paper...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Create form data for the API call
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Lehmer_2019_ApJS_243_3.pdf');
    formData.append('model', 'ollama-llama32');
    formData.append('style', 'summary');
    
    // Call the API endpoint
    const response = await fetch('http://localhost:3001/api/apps/pdf-notes', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`\n✅ API Response successful!`);
      console.log(`- File: ${result.metadata.fileName}`);
      console.log(`- Pages: ${result.metadata.pages}`);
      console.log(`- Text length: ${result.metadata.textLength} characters`);
      console.log(`- Processing time: ${result.metadata.processingTime}ms`);
      console.log(`- AI processing time: ${result.metadata.aiProcessingTime}ms`);
      
      // Check for astrophysics-related content in extracted text
      const extractedText = result.extractedText.toLowerCase();
      const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
      const foundTerms = astrophysicsTerms.filter(term => extractedText.includes(term));
      
      console.log(`\nAstrophysics terms found in extracted text: ${foundTerms.join(', ')}`);
      
      // Check generated notes for astrophysics content
      const generatedNotes = result.generatedNotes.toLowerCase();
      const notesTerms = astrophysicsTerms.filter(term => generatedNotes.includes(term));
      
      console.log(`Astrophysics terms found in generated notes: ${notesTerms.join(', ')}`);
      
      // Show first 500 characters of extracted text
      console.log(`\nFirst 500 characters of extracted text:`);
      console.log(result.extractedText.substring(0, 500));
      
      // Show first 500 characters of generated notes
      console.log(`\nFirst 500 characters of generated notes:`);
      console.log(result.generatedNotes.substring(0, 500));
      
      // Check if we have healthcare content (should be none)
      const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical', 'healthcare'];
      const foundHealthcareInText = healthcareTerms.filter(term => extractedText.includes(term));
      const foundHealthcareInNotes = healthcareTerms.filter(term => generatedNotes.includes(term));
      
      if (foundHealthcareInText.length > 0 || foundHealthcareInNotes.length > 0) {
        console.log(`\n⚠️ WARNING: Found healthcare terms in text: ${foundHealthcareInText.join(', ')}`);
        console.log(`⚠️ WARNING: Found healthcare terms in notes: ${foundHealthcareInNotes.join(', ')}`);
      } else {
        console.log(`\n✅ No healthcare content found - extraction and AI processing working correctly!`);
      }
      
    } else {
      console.error('❌ API returned error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testPDFExtractionAPI();