const fs = require('fs');
const path = require('path');

async function testSimplePDF() {
  try {
    console.log('🧪 Testing PDF Notes Pipeline with Simple PDF...');
    
    // Use the test PDF from pdf-parse
    const pdfPath = path.join(__dirname, 'node_modules/pdf-parse/test/data/01-valid.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ Test PDF not found');
      return;
    }
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log(`✅ Test PDF loaded: ${pdfBuffer.length} bytes`);
    
    // Create FormData 
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', pdfBuffer, 'test.pdf');
    formData.append('model', 'ollama-llama32');
    formData.append('style', 'summary');
    
    console.log('\n🚀 Sending request to API...');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3002/api/apps/pdf-notes', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        console.log('\n🎉 SUCCESS! PDF processing working!');
        console.log(`📄 Text extracted: ${result.extractedText.length} characters`);
        console.log(`🤖 Notes generated: ${result.generatedNotes.length} characters`);
        
        // Show first 200 chars of each
        console.log('\n📄 EXTRACTED TEXT PREVIEW:');
        console.log(result.extractedText.substring(0, 200) + '...');
        
        console.log('\n🤖 AI NOTES PREVIEW:');
        console.log(result.generatedNotes.substring(0, 200) + '...');
        
        // Check if it's real content
        if (result.extractedText.includes('mock') || result.extractedText.includes('sample healthcare')) {
          console.log('\n❌ ISSUE: Still showing mock content');
        } else {
          console.log('\n✅ VERIFIED: Real PDF content extracted');
        }
        
      } else {
        console.log(`\n❌ API Error: ${result.error}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`\n❌ HTTP Error ${response.status}: ${errorText}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testSimplePDF();