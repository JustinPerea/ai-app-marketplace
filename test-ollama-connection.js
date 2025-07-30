// Test Node.js connection to Ollama
async function testOllamaConnection() {
  try {
    console.log('🔍 Testing Node.js → Ollama connection...');
    
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Version check
    console.log('\n1️⃣ Testing version endpoint...');
    const versionResponse = await fetch('http://localhost:11434/api/version');
    console.log(`Status: ${versionResponse.status}`);
    if (versionResponse.ok) {
      const version = await versionResponse.json();
      console.log(`✅ Ollama version: ${version.version}`);
    }
    
    // Test 2: Simple generation
    console.log('\n2️⃣ Testing generation endpoint...');
    const genResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: 'Say hello',
        stream: false,
        options: {
          num_ctx: 4096,
          temperature: 0.3,
          num_predict: 20
        }
      })
    });
    
    console.log(`Status: ${genResponse.status}`);
    
    if (genResponse.ok) {
      const result = await genResponse.json();
      console.log(`✅ Response: ${result.response}`);
      console.log(`⏱️ Total duration: ${result.total_duration / 1000000}ms`);
    } else {
      const error = await genResponse.text();
      console.log(`❌ Error: ${error}`);
    }
    
    console.log('\n✅ Node.js can connect to Ollama successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔍 Debugging info:');
    console.log('- Check if Ollama is running: ollama ps');
    console.log('- Check if port 11434 is accessible');
    console.log('- Try restarting Ollama service');
  }
}

testOllamaConnection();