# Simple Chatbot Test Application

This test application validates the basic functionality of the AI Marketplace SDK by creating a simple interactive chatbot.

## Purpose

- **Validate basic SDK functionality**: Ensures the SDK can successfully make API calls
- **Test multiple providers**: Verifies OpenAI, Anthropic, and Google AI integrations
- **Confirm error handling**: Tests proper error handling and fallback logic
- **Verify response parsing**: Ensures responses are correctly formatted and accessible

## Features Tested

- ✅ Client initialization with API keys
- ✅ Basic chat completions
- ✅ Provider-specific requests
- ✅ Error handling and fallback logic
- ✅ Response formatting and metadata
- ✅ Cost tracking and usage statistics

## Prerequisites

Before running this test application, ensure you have:

1. **API Keys**: At least one of the following:
   - OpenAI API Key (`OPENAI_API_KEY`)
   - Anthropic API Key (`ANTHROPIC_API_KEY`)
   - Google AI API Key (`GOOGLE_API_KEY`)

2. **Environment Setup**: Create a `.env` file in this directory:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_google_key_here
   ```

3. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Running the Tests

### Interactive Mode (Recommended)
```bash
npm start
```

This will start an interactive chatbot where you can:
- Type messages and get AI responses
- Test different providers by typing `/provider <openai|anthropic|google>`
- View cost information with `/cost`
- Exit with `/quit`

### Automated Test Suite
```bash
npm test
```

This runs a comprehensive test suite that validates:
- All providers work correctly
- Error handling functions properly
- Response formatting is consistent
- Cost calculations are accurate

### Individual Provider Tests
```bash
# Test OpenAI specifically
npm run test:openai

# Test Anthropic specifically  
npm run test:anthropic

# Test Google AI specifically
npm run test:google
```

### Performance Benchmarks
```bash
npm run benchmark
```

Tests response times and performance across all providers.

## Expected Results

### Successful Test Output
```
🤖 Simple Chatbot Test Application
=====================================

✅ Testing OpenAI Provider...
   Provider: openai
   Response time: 1.2s
   Cost: $0.000023
   Tokens: 67

✅ Testing Anthropic Provider...
   Provider: anthropic
   Response time: 0.8s
   Cost: $0.000018
   Tokens: 52

✅ Testing Google AI Provider...
   Provider: google
   Response time: 0.6s
   Cost: $0.000012
   Tokens: 58

✅ Testing ML Routing...
   Selected provider: google (cost-optimized)
   Response time: 0.7s
   Cost: $0.000011

✅ Testing Error Handling...
   Fallback mechanism: Working
   Error types: Handled correctly

=====================================
📊 Test Summary:
   Total tests: 12
   Passed: 12
   Failed: 0
   Average response time: 0.9s
   Total cost: $0.000064
=====================================
```

### Performance Benchmarks
- **Response Time**: < 2 seconds for typical requests
- **First Token**: < 500ms for streaming
- **Fallback Time**: < 1 second when switching providers
- **Cost Efficiency**: Automatic selection of most cost-effective provider

## Test Cases Covered

### 1. Basic Functionality
- [x] Client initialization
- [x] Simple chat request
- [x] Response parsing
- [x] Metadata extraction

### 2. Provider Testing
- [x] OpenAI GPT models
- [x] Anthropic Claude models
- [x] Google Gemini models
- [x] Provider-specific features

### 3. ML Routing
- [x] Automatic provider selection
- [x] Cost optimization
- [x] Speed optimization
- [x] Quality optimization
- [x] Balanced optimization

### 4. Error Scenarios
- [x] Invalid API keys
- [x] Network failures
- [x] Provider outages
- [x] Invalid requests
- [x] Rate limiting

### 5. Edge Cases
- [x] Empty messages
- [x] Very long messages
- [x] Special characters
- [x] Multiple conversations
- [x] Concurrent requests

## Troubleshooting

### Common Issues

**Error: "API key not provided"**
- Ensure your `.env` file exists and contains valid API keys
- Check that environment variables are loaded correctly

**Error: "Provider not available"**
- Verify API keys are valid and active
- Check provider service status
- Ensure proper network connectivity

**Error: "Request timeout"**
- Check network connection
- Try with different providers
- Increase timeout in configuration

**Slow responses**
- Check network latency
- Try different optimization settings
- Consider using streaming for better perceived performance

### Debug Mode

Run with debug logging enabled:
```bash
DEBUG=true npm start
```

This will show detailed logs including:
- Request/response payloads
- Provider selection decisions
- Performance metrics
- Error details

## Files Structure

```
01-simple-chatbot/
├── README.md           # This file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── src/
│   ├── index.js        # Main application entry
│   ├── chatbot.js      # Chatbot implementation
│   ├── tests.js        # Automated test suite
│   └── benchmark.js    # Performance benchmarks
├── logs/               # Test execution logs
└── results/            # Test results and reports
```

## Success Criteria

This test application passes when:

1. **All Providers Work**: Successfully connects to and receives responses from all configured providers
2. **ML Routing Functions**: Intelligent routing selects appropriate providers based on optimization criteria
3. **Error Handling Works**: Graceful handling of errors with appropriate fallback mechanisms
4. **Performance Meets Targets**: Response times within acceptable limits
5. **Cost Tracking Accurate**: Proper cost calculation and reporting
6. **No Memory Leaks**: Stable memory usage during extended operations

## Next Steps

After this test passes:
1. Proceed to [Cost-Optimized Assistant](../02-cost-optimized-assistant/)
2. Review any issues found and update the troubleshooting guide
3. Document performance baselines for comparison
4. Update SDK if any bugs are discovered