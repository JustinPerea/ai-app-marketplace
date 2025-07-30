/**
 * AI Integration for Code Review Analysis
 * Handles communication with various AI models for code analysis
 */

import { CodeComplexity, ReviewType } from './complexity-analyzer';

export interface AIModelConfig {
  name: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  requiresApiKey: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  actualCost?: number;
}

export interface GenerateCodeReviewOptions {
  code: string;
  language: string;
  reviewType: ReviewType;
  provider: string;
  apiKey?: string;
  complexity: CodeComplexity;
}

// Model configurations optimized for code review
export const MODEL_CONFIGS: { [key: string]: AIModelConfig } = {
  'ollama-llama32': {
    name: 'llama3.2:3b',
    maxTokens: 2048,
    temperature: 0.1, // Low temperature for consistent code analysis
    timeout: 180000,
    requiresApiKey: false,
  },
  'ollama-llama33': {
    name: 'llama3.3',
    maxTokens: 4096,
    temperature: 0.1,
    timeout: 240000,
    requiresApiKey: false,
  },
  'openai-gpt4': {
    name: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.1,
    timeout: 30000,
    requiresApiKey: true,
  },
  'anthropic-claude': {
    name: 'claude-3-haiku-20240307',
    maxTokens: 4096,
    temperature: 0.1,
    timeout: 20000,
    requiresApiKey: true,
  },
  'google-gemini': {
    name: 'gemini-1.5-flash',
    maxTokens: 8192,
    temperature: 0.1,
    timeout: 30000,
    requiresApiKey: true,
  },
};

/**
 * Generate code review using AI with intelligent prompting
 */
export async function generateCodeReviewWithAI(options: GenerateCodeReviewOptions): Promise<AIResponse> {
  const { code, language, reviewType, provider, apiKey, complexity } = options;
  const config = MODEL_CONFIGS[provider];
  
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  
  if (config.requiresApiKey && !apiKey) {
    throw new Error(`API key required for provider: ${provider}`);
  }

  const startTime = Date.now();

  try {
    // Create specialized prompt based on review type and complexity
    const prompt = createCodeReviewPrompt(code, language, reviewType, complexity);
    
    // Call the appropriate AI model
    const response = await callAIModel(prompt, provider, apiKey);
    
    response.processingTime = Date.now() - startTime;
    return response;

  } catch (error) {
    throw new Error(`AI code review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create specialized prompts for different review types and complexity levels
 */
function createCodeReviewPrompt(code: string, language: string, reviewType: ReviewType, complexity: CodeComplexity): string {
  const baseInstructions = `You are an expert senior software engineer and security specialist with 15+ years of experience. Analyze the provided ${language} code with extreme attention to detail.`;
  
  let reviewInstructions = '';
  let focusAreas = '';
  let outputFormat = '';
  
  switch (reviewType) {
    case 'security':
      reviewInstructions = `Focus specifically on security vulnerabilities and potential attack vectors:
- Identify all security vulnerabilities (injection attacks, XSS, CSRF, etc.)
- Check for authentication and authorization flaws
- Look for sensitive data exposure or improper handling
- Find insecure cryptographic implementations
- Detect improper input validation and sanitization
- Check for insecure dependencies or configurations`;

      focusAreas = `CRITICAL SECURITY AREAS TO EXAMINE:
• Input validation and sanitization
• Authentication and session management
• Authorization and access controls
• Cryptographic implementations
• Database query construction (SQL injection)
• File operations and path traversal
• Error handling and information disclosure
• Third-party dependencies and imports
• Hardcoded secrets or credentials
• Cross-site scripting (XSS) vulnerabilities`;

      outputFormat = `# Security Analysis Report

## 🚨 Critical Security Issues
[List any critical vulnerabilities that need immediate attention]

## ⚠️ Security Warnings
[List moderate security concerns that should be addressed]

## 🛡️ Security Recommendations
[List proactive security improvements]

## ✅ Security Strengths
[Highlight security practices done well]

## 📊 Security Score: X/10
[Provide overall security rating with justification]`;
      break;

    case 'performance':
      reviewInstructions = `Focus on performance optimization and efficiency:
- Identify performance bottlenecks and inefficiencies
- Analyze algorithmic complexity (Big O notation)
- Check for memory leaks and resource management
- Find expensive operations that could be optimized
- Look for unnecessary computations or redundant code
- Evaluate data structure choices and access patterns`;

      focusAreas = `PERFORMANCE AREAS TO ANALYZE:
• Algorithm efficiency and Big O complexity
• Memory usage and potential leaks
• Database query optimization
• Loop efficiency and nested iterations
• Expensive function calls and operations
• Caching opportunities
• Data structure optimization
• Resource management (files, connections, etc.)
• Asynchronous vs synchronous operations
• Code path optimization`;

      outputFormat = `# Performance Analysis Report

## 🐌 Performance Bottlenecks
[List critical performance issues with impact assessment]

## ⚡ Optimization Opportunities
[List specific optimizations with expected improvements]

## 🔄 Algorithm Analysis
[Analyze time/space complexity of key algorithms]

## 💾 Memory Management
[Review memory usage and potential optimizations]

## 📈 Performance Score: X/10
[Provide overall performance rating with justification]`;
      break;

    case 'quality':
      reviewInstructions = `Focus on code quality, maintainability, and best practices:
- Evaluate code structure, organization, and readability
- Check adherence to coding standards and conventions
- Identify code smells and anti-patterns
- Review error handling and edge case coverage
- Assess testability and modularity
- Look for opportunities to improve maintainability`;

      focusAreas = `CODE QUALITY AREAS TO EXAMINE:
• Code organization and structure
• Naming conventions and clarity
• Function and class design principles
• Error handling and edge cases
• Code duplication and reusability
• Comments and documentation
• Testability and modularity
• Adherence to language-specific best practices
• Design patterns and architecture
• Technical debt indicators`;

      outputFormat = `# Code Quality Analysis Report

## 🏗️ Structural Issues
[List architectural and structural concerns]

## 🧹 Code Cleanliness
[Review naming, organization, and readability]

## 🔧 Refactoring Opportunities
[Suggest specific improvements for maintainability]

## 📚 Best Practices
[Compare against industry standards and conventions]

## 🎯 Quality Score: X/10
[Provide overall quality rating with justification]`;
      break;

    case 'comprehensive':
    default:
      reviewInstructions = `Provide a comprehensive code review covering security, performance, and quality:
- Conduct thorough security analysis for vulnerabilities
- Analyze performance and identify optimization opportunities
- Evaluate code quality, structure, and maintainability
- Check adherence to best practices and conventions
- Provide actionable recommendations with priorities`;

      focusAreas = `COMPREHENSIVE REVIEW AREAS:
• Security vulnerabilities and threats
• Performance bottlenecks and optimizations
• Code quality and maintainability
• Best practices and conventions
• Error handling and edge cases
• Testing and documentation
• Architecture and design patterns
• Dependencies and third-party code
• Scalability considerations
• Developer experience improvements`;

      outputFormat = `# Comprehensive Code Review Report

## 🚨 Critical Issues (Fix Immediately)
[High-priority security, performance, or reliability issues]

## ⚠️ Important Improvements (Address Soon)
[Moderate-priority quality and maintainability issues]

## 💡 Enhancement Suggestions (Consider)
[Optional improvements for better code quality]

## ✅ Strengths and Good Practices
[Highlight positive aspects of the code]

## 📊 Overall Assessment
- Security Score: X/10
- Performance Score: X/10  
- Quality Score: X/10
- Overall Score: X/10

## 🎯 Priority Action Items
1. [Most important fix]
2. [Second priority]
3. [Third priority]`;
      break;
  }
  
  // Adjust depth based on complexity
  const complexityInstructions = getComplexityInstructions(complexity);
  
  return `${baseInstructions}

${reviewInstructions}

${complexityInstructions}

${focusAreas}

ANALYSIS GUIDELINES:
- Be specific and actionable in all recommendations
- Provide exact line references when possible (use "Line X:" format)
- Include code examples for suggested improvements
- Explain the "why" behind each recommendation
- Prioritize issues by severity (Critical > Important > Enhancement)
- Consider the business impact of each issue
- Suggest alternative approaches when applicable

OUTPUT FORMAT:
${outputFormat}

IMPORTANT: 
- Focus on the most impactful issues first
- Provide concrete, actionable solutions
- Include severity levels for all findings
- Explain technical concepts clearly
- Consider both immediate fixes and long-term improvements

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

BEGIN ANALYSIS:`;
}

/**
 * Get complexity-specific instructions
 */
function getComplexityInstructions(complexity: CodeComplexity): string {
  switch (complexity) {
    case 'simple':
      return `CODE COMPLEXITY: SIMPLE
- Provide clear, beginner-friendly explanations
- Focus on fundamental best practices
- Include educational context for recommendations
- Suggest learning resources for improvement areas`;
      
    case 'moderate':
      return `CODE COMPLEXITY: MODERATE  
- Balance thoroughness with practical recommendations
- Focus on intermediate-level optimizations
- Highlight patterns that could be improved
- Consider maintainability and team collaboration`;
      
    case 'complex':
      return `CODE COMPLEXITY: COMPLEX
- Provide deep, expert-level analysis
- Consider advanced architectural patterns
- Focus on scalability and enterprise concerns
- Address sophisticated security and performance considerations
- Consider system-wide implications of recommendations`;
      
    default:
      return '';
  }
}

/**
 * Call appropriate AI model with timeout and error handling
 */
async function callAIModel(prompt: string, provider: string, apiKey?: string): Promise<AIResponse> {
  const config = MODEL_CONFIGS[provider];
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    let response: AIResponse;

    if (provider.startsWith('ollama-')) {
      response = await callOllama(prompt, config, controller.signal);
    } else if (provider.startsWith('openai-')) {
      response = await callOpenAI(prompt, config, apiKey!, controller.signal);
    } else if (provider.startsWith('anthropic-')) {
      response = await callAnthropic(prompt, config, apiKey!, controller.signal);
    } else if (provider.startsWith('google-')) {
      response = await callGoogleAI(prompt, config, apiKey!, controller.signal);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    clearTimeout(timeoutId);
    return response;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Code review timeout after ${config.timeout / 1000} seconds. Try using a cloud provider for faster analysis.`);
    }
    
    throw error;
  }
}

/**
 * Call Ollama API for local code review
 */
async function callOllama(prompt: string, config: AIModelConfig, signal: AbortSignal): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: config.name,
        prompt: prompt,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
          num_ctx: 4096, // Optimized context window
          top_p: 0.9,
          stop: ['Human:', 'Assistant:', 'User:'],
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Ollama model "${config.name}" not found. Please install it with: ollama pull ${config.name}`);
      } else if (response.status === 503) {
        throw new Error('Ollama service unavailable. Please ensure Ollama is running on localhost:11434');
      }
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Empty response from Ollama');
    }

    return {
      content: data.response.trim(),
      model: config.name,
      processingTime: Date.now() - startTime,
      actualCost: 0, // Free local processing
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434');
    }
    throw error;
  }
}

/**
 * Call OpenAI API for code review
 */
async function callOpenAI(prompt: string, config: AIModelConfig, apiKey: string, signal: AbortSignal): Promise<AIResponse> {
  const startTime = Date.now();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: config.name,
      messages: [
        { role: 'system', content: 'You are an expert senior software engineer specializing in code review and security analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    } else if (response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Try using Google Gemini (free tier) or reduce request frequency.');
    } else if (response.status === 402) {
      throw new Error('OpenAI quota exceeded. Please add a payment method or try Google Gemini (free tier).');
    }
    throw new Error(`OpenAI API error: ${response.status} ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenAI');
  }

  // Calculate actual cost (rough estimate)
  const tokensUsed = data.usage?.total_tokens || 0;
  const actualCost = (tokensUsed / 1000) * 0.01; // $0.01 per 1K tokens for GPT-4o

  return {
    content: data.choices[0].message.content.trim(),
    model: config.name,
    tokensUsed,
    processingTime: Date.now() - startTime,
    actualCost,
  };
}

/**
 * Call Anthropic API for code review
 */
async function callAnthropic(prompt: string, config: AIModelConfig, apiKey: string, signal: AbortSignal): Promise<AIResponse> {
  const startTime = Date.now();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    signal,
    body: JSON.stringify({
      model: config.name,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your API key and try again.');
    } else if (response.status === 429) {
      throw new Error('Anthropic rate limit exceeded. Please try again later or use Google Gemini.');
    }
    throw new Error(`Anthropic API error: ${response.status} ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.content?.[0]?.text) {
    throw new Error('Empty response from Anthropic');
  }

  // Calculate actual cost (rough estimate)
  const tokensUsed = data.usage?.output_tokens || 0;
  const actualCost = (tokensUsed / 1000) * 0.0003; // $0.0003 per 1K tokens for Claude Haiku

  return {
    content: data.content[0].text.trim(),
    model: config.name,
    tokensUsed,
    processingTime: Date.now() - startTime,
    actualCost,
  };
}

/**
 * Call Google AI API for code review
 */
async function callGoogleAI(prompt: string, config: AIModelConfig, apiKey: string, signal: AbortSignal): Promise<AIResponse> {
  const startTime = Date.now();
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.name}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [
        { parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid Google AI API key. Please check your API key and try again.');
    } else if (response.status === 429) {
      throw new Error('Google AI rate limit exceeded. Please try again later.');
    }
    throw new Error(`Google AI API error: ${response.status} ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Empty response from Google AI');
  }

  // Calculate actual cost (rough estimate)
  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
  const actualCost = (tokensUsed / 1000) * 0.0001; // $0.0001 per 1K tokens for Gemini Flash

  return {
    content: data.candidates[0].content.parts[0].text.trim(),
    model: config.name,
    tokensUsed,
    processingTime: Date.now() - startTime,
    actualCost,
  };
}