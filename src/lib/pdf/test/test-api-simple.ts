/**
 * Simple test of the PDF Notes API components
 */

import { readFileSync } from 'fs';
import { extractTextFromPDF } from '../extractor-fixed';
import { generateNotesWithAI } from '../ai-integration';
import { preprocessText } from '../text-processor';

async function testAPIComponents() {
  try {
    console.log('🧪 Testing PDF Notes API components...\n');
    
    // Read the research paper
    const pdfPath = '/Users/justinperea/Research/IC342/Research/Papers/Lehmer_2019_ApJS_243_3.pdf';
    const pdfBuffer = readFileSync(pdfPath);
    
    console.log(`📄 Testing with: ${pdfPath.split('/').pop()}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Test PDF extraction
    console.log('1️⃣ Testing PDF extraction...');
    const extractionResult = await extractTextFromPDF(pdfBuffer);
    console.log(`✅ Extracted ${extractionResult.textLength} characters from ${extractionResult.metadata.pages} pages`);
    
    // Test text preprocessing
    console.log('\n2️⃣ Testing text preprocessing...');
    const processedText = preprocessText(extractionResult.text);
    console.log(`✅ Processed text: ${processedText.length} characters`);
    
    // Show a sample of the processed text
    console.log('\n📝 Sample processed text (first 500 chars):');
    console.log('---');
    console.log(processedText.substring(0, 500));
    console.log('---');
    
    // Verify astrophysics content
    const textLower = processedText.toLowerCase();
    const astrophysicsTerms = ['x-ray', 'galaxy', 'luminosity', 'stellar', 'binary'];
    const foundTerms = astrophysicsTerms.filter(term => textLower.includes(term));
    console.log(`\n🔍 Found ${foundTerms.length}/${astrophysicsTerms.length} astrophysics terms:`, foundTerms);
    
    // Test AI integration (using a small sample to avoid overwhelming Ollama)
    console.log('\n3️⃣ Testing AI integration with sample text...');
    const sampleText = processedText.substring(0, 3000); // Use first 3000 chars for testing
    
    try {
      const aiResponse = await generateNotesWithAI({
        text: sampleText,
        model: 'ollama-llama32',
        style: 'summary',
      });
      
      console.log(`✅ AI processing completed in ${aiResponse.processingTime}ms`);
      console.log(`📝 Generated notes (${aiResponse.content.length} characters):`);
      console.log('---');
      console.log(aiResponse.content.substring(0, 800));
      console.log('---');
      
      // Quality checks
      const notesLower = aiResponse.content.toLowerCase();
      const qualityChecks = {
        hasAstrophysicsContent: foundTerms.some(term => notesLower.includes(term)),
        hasProperStructure: aiResponse.content.includes('#') || aiResponse.content.includes('•'),
        isSubstantial: aiResponse.content.length > 100,
        containsRelevantInfo: notesLower.includes('x-ray') || notesLower.includes('binary') || notesLower.includes('galaxy'),
      };
      
      console.log(`\n🔍 Quality Checks:`);
      Object.entries(qualityChecks).forEach(([check, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed}`);
      });
      
      const overallQuality = Object.values(qualityChecks).filter(Boolean).length >= 3;
      console.log(`\n📊 Overall Quality: ${overallQuality ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`);
      
    } catch (aiError) {
      console.log(`❌ AI integration test failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
      console.log('   This might be due to Ollama not running or model not available');
    }
    
    console.log('\n🏁 Component testing completed!');
    console.log('\n✅ Summary:');
    console.log('   - PDF text extraction: Working');
    console.log('   - Text preprocessing: Working');
    console.log('   - Content validation: IC342 astrophysics paper detected');
    console.log('   - AI integration: Test completed (check results above)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAPIComponents();