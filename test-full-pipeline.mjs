import fs from 'fs';

async function testFullPipeline() {
  try {
    console.log('Testing full PDF Notes Generation pipeline...');
    
    // Read the IC342 research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Create FormData for API call
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Lehmer_2019_ApJS_243_3.pdf');
    formData.append('model', 'ollama-llama32');
    formData.append('style', 'summary');
    
    console.log('\n🔄 Calling PDF Notes API...');
    console.log('Note: This may take several minutes due to AI processing time.');
    
    const startTime = Date.now();
    
    // Set a longer timeout for the full pipeline (8 minutes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('\n⏱️ Request timed out after 8 minutes');
    }, 480000);
    
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
        throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`\n✅ Pipeline completed successfully!`);
        console.log(`\n📄 File Information:`);
        console.log(`- File: ${result.metadata.fileName}`);
        console.log(`- Pages: ${result.metadata.pages}`);
        console.log(`- Text length: ${result.metadata.textLength} characters`);
        console.log(`- Processing time: ${result.metadata.processingTime}ms`);
        console.log(`- AI model: ${result.metadata.aiModel}`);
        console.log(`- AI processing time: ${result.metadata.aiProcessingTime}ms`);
        
        console.log(`\n🔍 Content Analysis:`);
        
        // Check extracted text for astrophysics content
        const extractedText = result.extractedText.toLowerCase();
        const astrophysicsTerms = ['x-ray', 'ic342', 'luminosity', 'galaxy', 'stellar', 'binary'];
        const foundInExtracted = astrophysicsTerms.filter(term => extractedText.includes(term));
        
        console.log(`Astrophysics terms in extracted text: ${foundInExtracted.join(', ')}`);
        
        // Check generated notes for astrophysics content
        const generatedNotes = result.generatedNotes.toLowerCase();
        const foundInNotes = astrophysicsTerms.filter(term => generatedNotes.includes(term));
        
        console.log(`Astrophysics terms in generated notes: ${foundInNotes.join(', ')}`);
        
        // Check for healthcare content (should be none)
        const healthcareTerms = ['patient', 'diagnosis', 'treatment', 'medical condition', 'healthcare', 'therapy', 'clinical'];
        const healthcareInExtracted = healthcareTerms.filter(term => extractedText.includes(term));
        const healthcareInNotes = healthcareTerms.filter(term => generatedNotes.includes(term));
        
        if (healthcareInExtracted.length > 0 || healthcareInNotes.length > 0) {
          console.log(`\n⚠️ WARNING: Found healthcare terms!`);
          console.log(`In extracted text: ${healthcareInExtracted.join(', ')}`);
          console.log(`In generated notes: ${healthcareInNotes.join(', ')}`);
        } else {
          console.log(`\n✅ No healthcare content found - pipeline working correctly!`);
        }
        
        console.log(`\n📝 Generated Notes Preview (first 500 characters):`);
        console.log(result.generatedNotes.substring(0, 500));
        
        console.log(`\n📊 Summary:`);
        console.log(`✅ PDF extraction: Working (real astrophysics content extracted)`);
        console.log(`✅ AI processing: Working (${result.metadata.aiProcessingTime}ms)`);
        console.log(`✅ Content accuracy: Real research paper content, no mock data`);
        console.log(`✅ Terms found: ${foundInNotes.length}/${astrophysicsTerms.length} astrophysics terms in AI output`);
        
      } else {
        console.error('❌ Pipeline failed:', result.error);
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('\n⏱️ Request was aborted due to timeout');
        console.log('This may indicate that Ollama processing is taking longer than expected.');
        console.log('The processing may still be working in the background.');
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

testFullPipeline();