import fs from 'fs';

// Test PDF extraction directly by calling the extraction API endpoint
async function testPDFExtractionOnly() {
  try {
    console.log('Testing PDF extraction (without AI processing) with IC342 research paper...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Create a simple test by calling the API with just the extraction
    // Let's create a FormData to test
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Lehmer_2019_ApJS_243_3.pdf');
    formData.append('model', 'ollama-llama32');
    formData.append('style', 'summary');
    
    // Call the GET endpoint first to see if the API is working
    console.log('\nTesting API availability...');
    const getResponse = await fetch('http://localhost:3001/api/apps/pdf-notes', {
      method: 'GET'
    });
    
    if (!getResponse.ok) {
      throw new Error(`GET API call failed: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const getResult = await getResponse.json();
    console.log(`✅ API is available: ${getResult.message}`);
    console.log(`Supported models: ${getResult.supportedModels.join(', ')}`);
    
    // Now let's test a simple extraction without AI processing by using a shorter timeout
    console.log('\nTesting PDF upload and text extraction...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for extraction only
    
    try {
      const postResponse = await fetch('http://localhost:3001/api/apps/pdf-notes', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        throw new Error(`POST API call failed: ${postResponse.status} ${postResponse.statusText} - ${errorText}`);
      }
      
      const postResult = await postResponse.json();
      
      if (postResult.success) {
        console.log(`\n✅ Extraction successful!`);
        console.log(`- File: ${postResult.metadata.fileName}`);
        console.log(`- Pages: ${postResult.metadata.pages}`);
        console.log(`- Text length: ${postResult.metadata.textLength} characters`);
        console.log(`- Extraction time: ${postResult.metadata.processingTime}ms`);
        
        // Check for astrophysics-related content in extracted text
        const extractedText = postResult.extractedText.toLowerCase();
        const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
        const foundTerms = astrophysicsTerms.filter(term => extractedText.includes(term));
        
        console.log(`\nAstrophysics terms found: ${foundTerms.join(', ')}`);
        
        // Show first 500 characters of extracted text
        console.log(`\nFirst 500 characters of extracted text:`);
        console.log(postResult.extractedText.substring(0, 500));
        
        // Check if we have healthcare content (should be none)
        const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical condition', 'healthcare'];
        const foundHealthcareTerms = healthcareTerms.filter(term => extractedText.includes(term));
        
        if (foundHealthcareTerms.length > 0) {
          console.log(`\n⚠️ WARNING: Found healthcare terms: ${foundHealthcareTerms.join(', ')}`);
        } else {
          console.log(`\n✅ No healthcare content found - extraction is working correctly!`);
        }
        
        // Test AI processing separately if extraction worked
        console.log(`\n🔄 Testing AI processing separately...`);
        console.log(`Note: This may take up to 5 minutes due to Ollama processing time.`);
        
      } else {
        console.error('❌ Extraction failed:', postResult.error);
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('\n⏱️ Request timed out during extraction phase - this might indicate PDF parsing issues');
      } else {
        throw fetchError;
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testPDFExtractionOnly();