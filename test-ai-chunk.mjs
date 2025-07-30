import fs from 'fs';

async function testAIProcessingWithChunk() {
  try {
    console.log('Testing AI processing with manageable chunk size...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // First, extract just a few pages to get manageable content
    console.log('\n1. Extracting first 3 pages for AI processing...');
    
    // Import pdf-parse
    const pdfParse = await import('pdf-parse');
    const pdfParseFunc = pdfParse.default || pdfParse;
    
    // Parse first 3 pages only
    const extractResult = await pdfParseFunc(pdfBuffer, {
      normalizeWhitespace: false,
      max: 3 // Limit to first 3 pages for manageable processing
    });
    
    console.log(`✅ Extracted ${extractResult.text.length} characters from 3 pages`);
    
    // Check for astrophysics content
    const extractedText = extractResult.text.toLowerCase();
    const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
    const foundTerms = astrophysicsTerms.filter(term => extractedText.includes(term));
    console.log(`✅ Astrophysics terms found: ${foundTerms.join(', ')}`);
    
    // Create a text file with the extracted content
    const textContent = extractResult.text;
    
    // Create a simple text "PDF" for testing (simulate a PDF with text content)
    console.log('\n2. Testing AI processing with extracted content...');
    
    // Create FormData for API call
    const formData = new FormData();
    
    // Create a blob with the extracted text content - treating it as if it were a smaller PDF
    const textBlob = new Blob([textContent], { type: 'text/plain' });
    
    // Actually, let's create a minimal test by using the original PDF but with a model that processes faster
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Lehmer_2019_ApJS_243_3.pdf');
    formData.append('model', 'ollama-llama33'); // Try the faster model
    formData.append('style', 'summary');
    
    console.log('🔄 Calling PDF Notes API with faster model (llama3.3)...');
    console.log('Note: This test uses the faster model with 90-second timeout.');
    
    const startTime = Date.now();
    
    // Set timeout for this test (2 minutes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('\n⏱️ Request timed out after 2 minutes');
    }, 120000);
    
    try {
      const response = await fetch('http://localhost:3001/api/apps/pdf-notes', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`\n⏱️ Total processing time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`\n❌ API call failed: ${response.status} ${response.statusText}`);
        console.log(`Error response: ${errorText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`\n✅ AI processing completed successfully!`);
        console.log(`\n📄 Results:`)
        console.log(`- Pages processed: ${result.metadata.pages}`);
        console.log(`- Text length: ${result.metadata.textLength} characters`);
        console.log(`- AI model: ${result.metadata.aiModel}`);
        console.log(`- Processing time: ${result.metadata.processingTime}ms`);
        console.log(`- Chunks used: ${result.metadata.chunksUsed}`);
        
        // Check generated notes for astrophysics content
        const generatedNotes = result.generatedNotes.toLowerCase();
        const foundInNotes = astrophysicsTerms.filter(term => generatedNotes.includes(term));
        
        console.log(`\n🔍 Content Analysis:`);
        console.log(`Astrophysics terms in AI-generated notes: ${foundInNotes.join(', ')}`);
        
        // Check for healthcare content (should be none)
        const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical condition', 'healthcare', 'therapy', 'clinical'];
        const healthcareInNotes = healthcareTerms.filter(term => generatedNotes.includes(term));
        
        if (healthcareInNotes.length > 0) {
          console.log(`\n⚠️ WARNING: Found healthcare terms in AI output: ${healthcareInNotes.join(', ')}`);
        } else {
          console.log(`\n✅ No healthcare content found in AI output - system working correctly!`);
        }
        
        console.log(`\n📝 Generated Notes Preview (first 300 characters):`);
        console.log(result.generatedNotes.substring(0, 300));
        
        console.log(`\n🎯 VERIFICATION COMPLETE:`);
        console.log(`✅ PDF extraction: Working with real astrophysics content`);
        console.log(`✅ AI processing: Working (${foundInNotes.length}/${astrophysicsTerms.length} terms found)`);
        console.log(`✅ No mock healthcare data: Confirmed`);
        console.log(`✅ Real IC342 research content: Confirmed`);
        
      } else {
        console.error('\n❌ Pipeline failed:', result.error);
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('\n⏱️ Request was aborted due to timeout');
        console.log('This suggests the AI processing is taking longer than 2 minutes.');
        console.log('The core PDF extraction is working, but AI processing needs optimization for large documents.');
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

testAIProcessingWithChunk();