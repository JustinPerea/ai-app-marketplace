/**
 * Streaming Example
 * 
 * This example demonstrates streaming responses from the AI Marketplace SDK
 */

import { createClient, APIProvider } from '../src/index';

async function streamingExample() {
  const client = createClient({
    apiKeys: {
      openai: process.env.OPENAI_API_KEY!,
      anthropic: process.env.ANTHROPIC_API_KEY!,
      google: process.env.GOOGLE_API_KEY!,
    },
    config: {
      enableMLRouting: true,
    },
  });

  try {
    console.log('🌊 Starting streaming response...\n');
    
    const stream = client.chatStream({
      messages: [
        {
          role: 'user',
          content: 'Write a short story about a robot discovering emotions for the first time. Make it engaging and thoughtful.'
        }
      ],
    }, {
      optimizeFor: 'quality',
    });

    let responseText = '';
    let provider = '';
    let tokenCount = 0;

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        const content = chunk.choices[0].delta.content;
        process.stdout.write(content);
        responseText += content;
        tokenCount++;
      }
      
      if (!provider && chunk.provider) {
        provider = chunk.provider;
      }

      // Handle finish reason
      if (chunk.choices[0].finishReason) {
        console.log('\n\n---');
        console.log(`Provider used: ${provider}`);
        console.log(`Finish reason: ${chunk.choices[0].finishReason}`);
        console.log(`Total chunks received: ${tokenCount}`);
        
        if (chunk.usage) {
          console.log(`Total tokens: ${chunk.usage.totalTokens}`);
          console.log(`Cost: $${chunk.usage.cost.toFixed(6)}`);
        }
        break;
      }
    }

    console.log('\n✅ Streaming completed!');

  } catch (error) {
    console.error('❌ Streaming error:', error);
  }
}

async function multipleStreamingExample() {
  const client = createClient({
    apiKeys: {
      openai: process.env.OPENAI_API_KEY!,
      anthropic: process.env.ANTHROPIC_API_KEY!,
      google: process.env.GOOGLE_API_KEY!,
    },
  });

  const prompts = [
    'Explain photosynthesis in simple terms',
    'Write a Python function to reverse a string',
    'What are the main causes of climate change?',
  ];

  console.log('🔄 Comparing streaming across different providers...\n');

  for (const [index, prompt] of prompts.entries()) {
    console.log(`\n📝 Prompt ${index + 1}: "${prompt}"\n`);
    
    // Let ML routing choose the best provider for each prompt
    const stream = client.chatStream({
      messages: [{ role: 'user', content: prompt }],
    }, {
      optimizeFor: 'balanced',
    });

    let responseText = '';
    let startTime = Date.now();
    let firstTokenTime = 0;
    let provider = '';

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        if (!firstTokenTime) {
          firstTokenTime = Date.now() - startTime;
        }
        const content = chunk.choices[0].delta.content;
        process.stdout.write(content);
        responseText += content;
      }
      
      if (!provider && chunk.provider) {
        provider = chunk.provider;
      }

      if (chunk.choices[0].finishReason) {
        const totalTime = Date.now() - startTime;
        console.log('\n');
        console.log(`Provider: ${provider}`);
        console.log(`Time to first token: ${firstTokenTime}ms`);
        console.log(`Total time: ${totalTime}ms`);
        if (chunk.usage) {
          console.log(`Cost: $${chunk.usage.cost.toFixed(6)}`);
        }
        console.log('---');
        break;
      }
    }
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await streamingExample();
    console.log('\n\n');
    await multipleStreamingExample();
  })();
}