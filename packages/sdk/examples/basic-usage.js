/**
 * Basic Usage Example - AI Marketplace SDK
 * 
 * This example demonstrates the core functionality of the SDK
 * with mocked API responses for demonstration purposes.
 */

const { Chat, openai, claude } = require('../dist/index.js');

// Mock fetch to demonstrate SDK functionality without real API calls
global.fetch = async (url, options) => {
  console.log(`Mock API call to: ${url}`);
  
  // Mock OpenAI response
  if (url.includes('openai')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'chatcmpl-mock-123',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gpt-4o',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! This is a mock response from OpenAI GPT-4o. The SDK is working correctly!'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      })
    };
  }
  
  // Mock Claude response
  if (url.includes('anthropic')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'msg_mock_123',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'Hello! This is a mock response from Claude 3.5 Sonnet. The SDK successfully abstracted the provider differences!'
        }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 25
        }
      })
    };
  }
  
  throw new Error('Unknown API endpoint');
};

async function demonstrateSDK() {
  console.log('🚀 AI Marketplace SDK - Basic Usage Example\n');

  // Example 1: OpenAI Chat
  console.log('1. OpenAI Chat Example:');
  const openaiChat = new Chat({
    provider: openai({ 
      apiKey: 'mock-key',
      model: 'gpt-4o' 
    })
  });

  try {
    const openaiResponse = await openaiChat.ask('Hello, world!');
    console.log('✅ OpenAI Response:', openaiResponse);
    console.log('');
  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
  }

  // Example 2: Claude Chat
  console.log('2. Claude Chat Example:');
  const claudeChat = new Chat({
    provider: claude({ 
      apiKey: 'mock-key',
      model: 'claude-3-5-sonnet-20241022' 
    })
  });

  try {
    const claudeResponse = await claudeChat.ask('Hello from Claude!');
    console.log('✅ Claude Response:', claudeResponse);
    console.log('');
  } catch (error) {
    console.error('❌ Claude Error:', error.message);
  }

  // Example 3: Provider Switching
  console.log('3. Provider Switching Example:');
  const flexibleChat = new Chat({
    provider: openai({ apiKey: 'mock-key' })
  });

  try {
    // Start with OpenAI
    const response1 = await flexibleChat.ask('First message');
    console.log('✅ OpenAI Response:', response1);

    // Switch to Claude for next message
    const response2 = await flexibleChat.complete({
      messages: [{ role: 'user', content: 'Second message' }]
    }, {
      provider: claude({ apiKey: 'mock-key' })
    });
    console.log('✅ Claude Response:', response2.choices[0].message.content);
    console.log('');
  } catch (error) {
    console.error('❌ Provider Switching Error:', error.message);
  }

  // Example 4: Conversation
  console.log('4. Stateful Conversation Example:');
  const conversation = openaiChat.conversation({
    system: 'You are a helpful assistant that gives short responses.'
  });

  try {
    const greeting = await conversation.say('Hi there!');
    console.log('✅ Conversation 1:', greeting);

    const followup = await conversation.say('How are you doing?');
    console.log('✅ Conversation 2:', followup);

    const history = conversation.getHistory();
    console.log('📋 Conversation History Length:', history.length);
    console.log('');
  } catch (error) {
    console.error('❌ Conversation Error:', error.message);
  }

  // Example 5: Error Handling
  console.log('5. Error Handling Example:');
  
  // Simulate a rate limit error
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 429,
    json: async () => ({
      error: {
        message: 'Rate limit exceeded',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded'
      }
    })
  });

  try {
    await openaiChat.ask('This will fail');
  } catch (error) {
    console.log('✅ Caught Rate Limit Error:', error.code);
    console.log('   Message:', error.message);
  }

  // Restore original fetch
  global.fetch = originalFetch;

  console.log('\n🎉 SDK Demo Complete! All core features are working.');
  console.log('\nNext Steps:');
  console.log('- Replace mock API keys with real ones');
  console.log('- Remove the fetch mock for real API calls');
  console.log('- Explore advanced features like constraints and fallbacks');
}

// Run the demonstration
demonstrateSDK().catch(console.error);