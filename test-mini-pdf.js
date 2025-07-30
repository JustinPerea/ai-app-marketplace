const fs = require('fs');

async function testMiniPDF() {
  try {
    console.log('🔬 Testing MINIMAL PDF processing...');
    
    // Create a tiny test PDF content (just text)
    const testText = "This is a short test document. It contains only a few sentences. The goal is to test AI processing speed with minimal content.";
    
    // Create FormData with text instead of actual PDF for speed testing
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Create a small buffer that looks like a PDF
    const minimaltPDFBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(' + testText + ')Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000202 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n296\n%%EOF');
    
    formData.append('file', minimaltPDFBuffer, {
      filename: 'mini-test.pdf',
      contentType: 'application/pdf'
    });
    formData.append('model', 'ollama-llama32');
    formData.append('style', 'summary');
    
    console.log(`📄 Test content: "${testText}"`);
    console.log('⚡ Testing optimized settings...');
    
    const fetch = (await import('node-fetch')).default;
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/apps/pdf-notes', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`⏱️ Total request time: ${(totalTime / 1000).toFixed(1)}s`);
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        console.log('\n🎉 SUCCESS! Mini PDF processing working!');
        
        const aiTimeSeconds = result.metadata.aiProcessingTime / 1000;
        console.log('\n📊 PERFORMANCE RESULTS:');
        console.log(`- AI processing: ${aiTimeSeconds.toFixed(1)}s`);
        console.log(`- Total processing: ${(result.metadata.processingTime / 1000).toFixed(1)}s`);
        console.log(`- AI model: ${result.metadata.aiModel}`);
        
        console.log('\n🤖 AI RESPONSE:');
        console.log(result.generatedNotes);
        
        // Performance verification
        if (aiTimeSeconds < 10) {
          console.log('\n🚀 EXCELLENT: Under 10 seconds!');
        } else if (aiTimeSeconds < 30) {
          console.log('\n✅ GOOD: Under 30 seconds target');
        } else {
          console.log('\n⚠️ SLOW: Still over 30 seconds');
        }
        
      } else {
        console.log(`\n❌ API Error: ${result.error}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`\n❌ HTTP Error ${response.status}:`);
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testMiniPDF();