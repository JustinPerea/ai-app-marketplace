/**
 * Interactive Chatbot for Manual Testing
 * 
 * This provides an interactive interface to manually test the AI Marketplace SDK
 */

require('dotenv').config();
const readline = require('readline');
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class InteractiveChatbot {
  constructor() {
    this.client = null;
    this.currentProvider = null;
    this.conversationHistory = [];
    this.settings = {
      enableMLRouting: true,
      optimizeFor: 'balanced',
      showCost: true,
      showResponseTime: true,
      enableStreaming: false
    };
  }

  async initialize() {
    log('🤖 Interactive AI Marketplace SDK Chatbot', 'magenta');
    log('=========================================', 'magenta');
    
    // Check for API keys
    const apiKeys = {};
    
    if (process.env.OPENAI_API_KEY) {
      apiKeys.openai = process.env.OPENAI_API_KEY;
      log('✓ OpenAI API key loaded', 'green');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      apiKeys.anthropic = process.env.ANTHROPIC_API_KEY;
      log('✓ Anthropic API key loaded', 'green');
    }
    
    if (process.env.GOOGLE_API_KEY) {
      apiKeys.google = process.env.GOOGLE_API_KEY;
      log('✓ Google AI API key loaded', 'green');
    }
    
    if (Object.keys(apiKeys).length === 0) {
      log('❌ No API keys found!', 'red');
      log('Please set at least one of:', 'yellow');
      log('  OPENAI_API_KEY', 'yellow');
      log('  ANTHROPIC_API_KEY', 'yellow');
      log('  GOOGLE_API_KEY', 'yellow');
      process.exit(1);
    }
    
    // Initialize client
    this.client = createClient({
      apiKeys,
      config: {
        enableMLRouting: this.settings.enableMLRouting,
        enableAnalytics: true,
        router: {
          fallbackEnabled: true,
          fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
        },
        cache: {
          enabled: false, // Disable for interactive testing
        },
      },
    });
    
    log('\n🎯 Available Commands:', 'cyan');
    log('  /help              - Show this help message', 'white');
    log('  /provider <name>   - Set specific provider (openai, anthropic, google, auto)', 'white');
    log('  /optimize <type>   - Set optimization (cost, speed, quality, balanced)', 'white');
    log('  /streaming         - Toggle streaming mode', 'white');
    log('  /cost              - Show cost information', 'white');
    log('  /analytics         - Show ML analytics', 'white');
    log('  /clear             - Clear conversation history', 'white');
    log('  /settings          - Show current settings', 'white');
    log('  /quit              - Exit the chatbot', 'white');
    log('\n💡 Tips:', 'yellow');
    log('  - Type normally to chat with the AI', 'gray');
    log('  - ML routing is enabled by default', 'gray');
    log('  - Cost and timing info is shown after each response', 'gray');
    
    this.showStatus();
  }

  showStatus() {
    log('\n📊 Current Settings:', 'blue');
    log(`  Provider: ${this.currentProvider || 'auto (ML routing)'}`, 'white');
    log(`  Optimization: ${this.settings.optimizeFor}`, 'white');
    log(`  ML Routing: ${this.settings.enableMLRouting ? 'enabled' : 'disabled'}`, 'white');
    log(`  Streaming: ${this.settings.enableStreaming ? 'enabled' : 'disabled'}`, 'white');
    log('');
    rl.prompt();
  }

  async handleCommand(input) {
    const parts = input.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.showHelp();
        break;
        
      case 'provider':
        if (args.length === 0) {
          log('Usage: /provider <openai|anthropic|google|auto>', 'yellow');
        } else {
          this.setProvider(args[0]);
        }
        break;
        
      case 'optimize':
        if (args.length === 0) {
          log('Usage: /optimize <cost|speed|quality|balanced>', 'yellow');
        } else {
          this.setOptimization(args[0]);
        }
        break;
        
      case 'streaming':
        this.toggleStreaming();
        break;
        
      case 'cost':
        await this.showCostInfo();
        break;
        
      case 'analytics':
        await this.showAnalytics();
        break;
        
      case 'clear':
        this.clearHistory();
        break;
        
      case 'settings':
        this.showStatus();
        return;
        
      case 'quit':
        log('Goodbye! 👋', 'magenta');
        process.exit(0);
        break;
        
      default:
        log(`Unknown command: ${command}`, 'red');
        log('Type /help for available commands', 'yellow');
    }
    
    rl.prompt();
  }

  showHelp() {
    log('\n🎯 Available Commands:', 'cyan');
    log('  /help              - Show this help message', 'white');
    log('  /provider <name>   - Set provider (openai, anthropic, google, auto)', 'white');
    log('  /optimize <type>   - Set optimization (cost, speed, quality, balanced)', 'white');
    log('  /streaming         - Toggle streaming mode', 'white');
    log('  /cost              - Show cost information', 'white');
    log('  /analytics         - Show ML analytics', 'white');
    log('  /clear             - Clear conversation history', 'white');
    log('  /settings          - Show current settings', 'white');
    log('  /quit              - Exit the chatbot', 'white');
  }

  setProvider(providerName) {
    const providers = {
      'openai': APIProvider.OPENAI,
      'anthropic': APIProvider.ANTHROPIC,
      'google': APIProvider.GOOGLE,
      'auto': null
    };
    
    if (providerName === 'auto') {
      this.currentProvider = null;
      this.settings.enableMLRouting = true;
      log('✓ Switched to automatic provider selection (ML routing)', 'green');
    } else if (providers[providerName]) {
      this.currentProvider = providers[providerName];
      this.settings.enableMLRouting = false;
      log(`✓ Switched to ${providerName} provider`, 'green');
    } else {
      log('Invalid provider. Use: openai, anthropic, google, or auto', 'red');
    }
  }

  setOptimization(type) {
    const validTypes = ['cost', 'speed', 'quality', 'balanced'];
    if (validTypes.includes(type)) {
      this.settings.optimizeFor = type;
      log(`✓ Optimization set to: ${type}`, 'green');
    } else {
      log('Invalid optimization type. Use: cost, speed, quality, or balanced', 'red');
    }
  }

  toggleStreaming() {
    this.settings.enableStreaming = !this.settings.enableStreaming;
    log(`✓ Streaming ${this.settings.enableStreaming ? 'enabled' : 'disabled'}`, 'green');
  }

  async showCostInfo() {
    try {
      const testRequest = {
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
      };
      
      const estimates = await this.client.estimateCost(testRequest);
      
      log('\n💰 Cost Estimates for "Hello, how are you?":', 'cyan');
      estimates.forEach(({ provider, cost }) => {
        log(`  ${provider}: $${cost.toFixed(6)}`, 'white');
      });
      log('');
      
    } catch (error) {
      log(`Error getting cost estimates: ${error.message}`, 'red');
    }
  }

  async showAnalytics() {
    try {
      const analytics = await this.client.getAnalytics();
      
      log('\n📊 ML Analytics:', 'cyan');
      log(`  Total predictions: ${analytics.totalPredictions}`, 'white');
      log(`  Average confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%`, 'white');
      
      if (analytics.modelRecommendations && analytics.modelRecommendations.length > 0) {
        log('  Model recommendations:', 'white');
        analytics.modelRecommendations.slice(0, 3).forEach(rec => {
          log(`    ${rec.scenario}: ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`, 'gray');
        });
      }
      log('');
      
    } catch (error) {
      log(`Error getting analytics: ${error.message}`, 'red');
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    log('✓ Conversation history cleared', 'green');
  }

  async handleChatMessage(message) {
    const userMessage = { role: 'user', content: message };
    this.conversationHistory.push(userMessage);

    const chatRequest = {
      messages: this.conversationHistory,
    };

    const options = {
      enableMLRouting: this.settings.enableMLRouting,
      optimizeFor: this.settings.optimizeFor
    };

    if (this.currentProvider) {
      options.provider = this.currentProvider;
    }

    try {
      const startTime = Date.now();
      
      if (this.settings.enableStreaming) {
        // Streaming response
        log('\nAI: ', 'cyan');
        let fullResponse = '';
        
        const stream = this.client.chatStream(chatRequest, options);
        
        for await (const chunk of stream) {
          if (chunk.choices[0].delta.content) {
            process.stdout.write(chunk.choices[0].delta.content);
            fullResponse += chunk.choices[0].delta.content;
          }
        }
        
        console.log(''); // New line after streaming
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'assistant', content: fullResponse });
        
        const responseTime = Date.now() - startTime;
        log(`\n⏱️  Response time: ${(responseTime / 1000).toFixed(2)}s`, 'gray');
        
      } else {
        // Non-streaming response
        const response = await this.client.chat(chatRequest, options);
        const responseTime = Date.now() - startTime;
        
        log(`\nAI (${response.provider}): ${response.choices[0].message.content}`, 'cyan');
        
        // Add to conversation history
        this.conversationHistory.push(response.choices[0].message);
        
        // Show metadata
        if (this.settings.showResponseTime) {
          log(`⏱️  Response time: ${(responseTime / 1000).toFixed(2)}s`, 'gray');
        }
        
        if (this.settings.showCost) {
          log(`💰 Cost: $${response.usage.cost.toFixed(6)} (${response.usage.totalTokens} tokens)`, 'gray');
        }
      }
      
    } catch (error) {
      if (error instanceof AIError) {
        log(`\n❌ AI Error: ${error.message}`, 'red');
        log(`   Code: ${error.code}`, 'gray');
        log(`   Type: ${error.type}`, 'gray');
        log(`   Provider: ${error.provider}`, 'gray');
        log(`   Retryable: ${error.retryable}`, 'gray');
      } else {
        log(`\n❌ Unexpected error: ${error.message}`, 'red');
      }
    }
  }

  start() {
    rl.on('line', async (input) => {
      const trimmedInput = input.trim();
      
      if (trimmedInput === '') {
        rl.prompt();
        return;
      }
      
      if (trimmedInput.startsWith('/')) {
        await this.handleCommand(trimmedInput);
      } else {
        await this.handleChatMessage(trimmedInput);
        rl.prompt();
      }
    });

    rl.on('close', () => {
      log('\nGoodbye! 👋', 'magenta');
      process.exit(0);
    });

    rl.prompt();
  }
}

// Start the interactive chatbot
async function main() {
  const chatbot = new InteractiveChatbot();
  await chatbot.initialize();
  chatbot.start();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Failed to start chatbot:', error);
    process.exit(1);
  });
}