/**
 * Function Calling Example
 * 
 * This example demonstrates function/tool calling capabilities
 */

import { createClient, APIProvider } from '../src/index';

// Mock functions for demonstration
const mockFunctions = {
  get_weather: async (location: string): Promise<string> => {
    // In a real application, this would call a weather API
    const weatherData = {
      'San Francisco, CA': '72°F, Sunny',
      'New York, NY': '68°F, Partly Cloudy',
      'London, UK': '15°C, Rainy',
      'Tokyo, Japan': '25°C, Clear',
    };
    
    return weatherData[location as keyof typeof weatherData] || '70°F, Unknown conditions';
  },

  calculate_math: async (expression: string): Promise<number> => {
    // Simple math calculator (be careful with eval in real applications)
    try {
      // Only allow basic math operations for safety
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      return eval(sanitized);
    } catch {
      throw new Error('Invalid mathematical expression');
    }
  },

  search_database: async (query: string): Promise<string[]> => {
    // Mock database search
    const mockData = [
      'Machine Learning fundamentals',
      'Deep Learning with PyTorch',
      'Natural Language Processing',
      'Computer Vision basics',
      'Reinforcement Learning',
    ];
    
    return mockData.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
  },
};

async function functionCallingExample() {
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

  // Define tools/functions
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'get_weather',
        description: 'Get current weather information for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The location to get weather for (e.g., "San Francisco, CA")',
            },
          },
          required: ['location'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'calculate_math',
        description: 'Perform mathematical calculations',
        parameters: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Mathematical expression to evaluate (e.g., "2 + 2 * 3")',
            },
          },
          required: ['expression'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'search_database',
        description: 'Search through a database of educational content',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find relevant content',
            },
          },
          required: ['query'],
        },
      },
    },
  ];

  try {
    console.log('🛠️ Function Calling Example\n');

    // Example 1: Weather query
    console.log('1️⃣ Weather Query');
    const weatherResponse = await client.chat({
      messages: [
        { role: 'user', content: 'What\'s the weather like in San Francisco?' }
      ],
      tools,
    }, {
      optimizeFor: 'quality',
    });

    console.log('Assistant:', weatherResponse.choices[0].message.content);
    
    if (weatherResponse.choices[0].toolCalls) {
      console.log('Tool calls requested:');
      for (const toolCall of weatherResponse.choices[0].toolCalls) {
        console.log(`- ${toolCall.function.name}(${toolCall.function.arguments})`);
        
        // Execute the function
        const args = JSON.parse(toolCall.function.arguments);
        if (toolCall.function.name === 'get_weather') {
          const result = await mockFunctions.get_weather(args.location);
          console.log(`  Result: ${result}`);
        }
      }
    }
    console.log('---\n');

    // Example 2: Math calculation
    console.log('2️⃣ Math Calculation');
    const mathResponse = await client.chat({
      messages: [
        { role: 'user', content: 'Can you calculate 15 * 7 + 23 for me?' }
      ],
      tools,
    });

    console.log('Assistant:', mathResponse.choices[0].message.content);
    
    if (mathResponse.choices[0].toolCalls) {
      for (const toolCall of mathResponse.choices[0].toolCalls) {
        console.log(`Tool call: ${toolCall.function.name}(${toolCall.function.arguments})`);
        
        const args = JSON.parse(toolCall.function.arguments);
        if (toolCall.function.name === 'calculate_math') {
          const result = await mockFunctions.calculate_math(args.expression);
          console.log(`Result: ${result}`);
        }
      }
    }
    console.log('---\n');

    // Example 3: Multi-step conversation with function calls
    console.log('3️⃣ Multi-step Conversation');
    
    const conversation = [
      { role: 'user' as const, content: 'I need help planning my day. First, what\'s the weather in New York?' },
    ];

    let response = await client.chat({
      messages: conversation,
      tools,
    });

    console.log('Step 1 - Assistant:', response.choices[0].message.content);
    
    // Handle tool calls
    if (response.choices[0].toolCalls) {
      for (const toolCall of response.choices[0].toolCalls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result = '';
        
        if (toolCall.function.name === 'get_weather') {
          result = await mockFunctions.get_weather(args.location);
          console.log(`Weather result: ${result}`);
          
          // Add the function result to conversation
          conversation.push({
            role: 'assistant',
            content: response.choices[0].message.content || '',
            // Note: In a real implementation, you'd also include the tool calls here
          });
          
          conversation.push({
            role: 'user',
            content: `Great! The weather is ${result}. Now can you search for machine learning content in the database?`,
          });
        }
      }
      
      // Continue the conversation
      const followUpResponse = await client.chat({
        messages: conversation,
        tools,
      });
      
      console.log('Step 2 - Assistant:', followUpResponse.choices[0].message.content);
      
      if (followUpResponse.choices[0].toolCalls) {
        for (const toolCall of followUpResponse.choices[0].toolCalls) {
          const args = JSON.parse(toolCall.function.arguments);
          if (toolCall.function.name === 'search_database') {
            const results = await mockFunctions.search_database(args.query);
            console.log(`Search results:`, results);
          }
        }
      }
    }

    console.log('---\n');

    // Example 4: Function calling with streaming
    console.log('4️⃣ Streaming with Function Calls');
    
    const streamingTools = [tools[0]]; // Just weather for simplicity
    
    const stream = client.chatStream({
      messages: [
        { role: 'user', content: 'What\'s the weather like in Tokyo and should I bring an umbrella?' }
      ],
      tools: streamingTools,
    });

    let streamResponse = '';
    let streamToolCalls: any[] = [];

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        process.stdout.write(chunk.choices[0].delta.content);
        streamResponse += chunk.choices[0].delta.content;
      }
      
      if (chunk.choices[0].delta.toolCalls) {
        streamToolCalls.push(...chunk.choices[0].delta.toolCalls);
      }
      
      if (chunk.choices[0].finishReason === 'tool_calls') {
        console.log('\n\nTool calls detected in stream:');
        streamToolCalls.forEach(toolCall => {
          if (toolCall.function?.name) {
            console.log(`- ${toolCall.function.name}`);
          }
        });
        break;
      }
      
      if (chunk.choices[0].finishReason === 'stop') {
        console.log('\n\nStreaming completed without tool calls.');
        break;
      }
    }

  } catch (error) {
    console.error('❌ Function calling error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  functionCallingExample();
}