/**
 * End-to-end test of the PDF Notes API with the IC342 research paper
 */

import { readFileSync } from 'fs';

async function testFullAPI() {
  try {
    console.log('🧪 Testing full PDF Notes API functionality...\n');
    
    // Read the research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = readFileSync(pdfPath);
    
    console.log(`📄 Testing with: ${pdfPath.split('/').pop()}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Test different styles with Ollama
    const testCases = [
      { model: 'ollama-llama32', style: 'summary', description: 'Executive Summary' },
      { model: 'ollama-llama32', style: 'structured', description: 'Structured Notes' },
      { model: 'ollama-llama32', style: 'actionable', description: 'Actionable Insights' },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🤖 Testing ${testCase.description} with ${testCase.model}...`);
      
      // Create form data
      const formData = new FormData();
      const file = new File([pdfBuffer], 'Lehmer_2019_ApJS_243_3.pdf', { type: 'application/pdf' });
      formData.append('file', file);
      formData.append('model', testCase.model);
      formData.append('style', testCase.style);
      
      const startTime = Date.now();
      
      try {
        const response = await fetch('http://localhost:3000/api/apps/pdf-notes', {
          method: 'POST',
          body: formData,
        });
        
        const processingTime = Date.now() - startTime;
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log(`❌ Test failed (${response.status}): ${errorData.error}`);
          continue;
        }
        
        const result = await response.json();
        
        console.log(`✅ Success! Processing took ${processingTime}ms`);
        console.log(`📋 Metadata:`);
        console.log(`   - Pages: ${result.metadata.pages}`);
        console.log(`   - Text length: ${result.metadata.textLength} chars`);
        console.log(`   - Chunks used: ${result.metadata.chunksUsed}`);
        console.log(`   - Tokens estimated: ${result.metadata.tokensEstimated}`);
        console.log(`   - AI processing time: ${result.metadata.aiProcessingTime}ms`);
        
        // Show first 500 characters of generated notes
        console.log(`\n📝 Generated Notes (first 500 chars):`);
        console.log('---');
        console.log(result.generatedNotes.substring(0, 500));
        console.log('---');
        
        // Verify content quality
        const notesLower = result.generatedNotes.toLowerCase();
        const qualityChecks = {
          hasAstrophysicsTerms: ['x-ray', 'galaxy', 'luminosity', 'stellar'].some(term => notesLower.includes(term)),
          hasIC342Context: notesLower.includes('lehmer') || notesLower.includes('binary'),
          hasProperFormatting: result.generatedNotes.includes('#') || result.generatedNotes.includes('•'),
          isSubstantial: result.generatedNotes.length > 200,
        };
        
        console.log(`\n🔍 Quality Checks:`);
        Object.entries(qualityChecks).forEach(([check, passed]) => {
          console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed}`);
        });
        
        const overallQuality = Object.values(qualityChecks).every(Boolean);
        console.log(`\n📊 Overall Quality: ${overallQuality ? '✅ PASSED' : '❌ FAILED'}`);
        
      } catch (error) {
        console.log(`❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait a bit between requests to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🏁 Full API testing completed!');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    process.exit(1);
  }
}

// Run the test
testFullAPI();