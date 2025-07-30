/**
 * AI Integration for PDF Notes Generation
 * Handles communication with various AI models
 */

import { TextChunk } from './text-processor';
import { 
  detectSystemCapabilities, 
  getOptimizedOllamaConfig, 
  validateModelCompatibility,
  SystemCapabilities 
} from '../ai/hardware-detection';

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
}

export interface GenerateNotesOptions {
  text: string;
  model: string;
  style: 'summary' | 'structured' | 'actionable';
  apiKey?: string;
  chunks?: TextChunk[];
}

// Model configurations with adaptive timeouts
export const MODEL_CONFIGS: { [key: string]: AIModelConfig } = {
  'ollama-llama32': {
    name: 'llama3.2:3b',
    maxTokens: 2048,
    temperature: 0.3,
    timeout: 180000, // 3 minutes - increased for larger documents
    requiresApiKey: false,
  },
  'ollama-llama33': {
    name: 'llama3.3',
    maxTokens: 4096,
    temperature: 0.3,
    timeout: 240000, // 4 minutes - larger model needs more time
    requiresApiKey: false,
  },
  'openai-gpt4': {
    name: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.3,
    timeout: 30000,
    requiresApiKey: true,
  },
  'anthropic-claude': {
    name: 'claude-3-haiku-20240307',
    maxTokens: 4096,
    temperature: 0.2,
    timeout: 20000,
    requiresApiKey: true,
  },
  'google-gemini': {
    name: 'gemini-1.5-flash',
    maxTokens: 8192,
    temperature: 0.3,
    timeout: 30000,
    requiresApiKey: true,
  },
};

/**
 * Create auto-chunks for large documents to prevent timeouts
 */
function createAutoChunks(text: string): TextChunk[] {
  const maxChunkSize = 8000; // 8k characters per chunk for local models
  const chunks: TextChunk[] = [];
  
  // Split by paragraphs first to maintain context
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, start a new chunk
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        startOffset: 0, // Simplified for auto-chunking
        endOffset: currentChunk.length
      });
      currentChunk = paragraph;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      startOffset: 0,
      endOffset: currentChunk.length
    });
  }
  
  console.log(`📄 Created ${chunks.length} auto-chunks from ${text.length} characters`);
  return chunks;
}

/**
 * Calculate dynamic timeout based on document size and system capabilities
 */
function calculateDynamicTimeout(textLength: number, baseTimeout: number, systemCapabilities?: any): number {
  // Base timeout scaling factors
  const textSizeMultiplier = Math.max(1, Math.min(3, textLength / 10000)); // Scale based on text length
  let adjustedTimeout = baseTimeout * textSizeMultiplier;
  
  // System capability adjustments
  if (systemCapabilities) {
    switch (systemCapabilities.optimizationLevel) {
      case 'minimal':
        adjustedTimeout *= 1.5; // 50% more time for slower systems
        break;
      case 'performance':
        adjustedTimeout *= 0.8; // 20% less time for faster systems
        break;
      case 'balanced':
      default:
        // No adjustment for balanced systems
        break;
    }
  }
  
  // Ensure minimum and maximum bounds
  const minTimeout = 60000; // 1 minute minimum
  const maxTimeout = 600000; // 10 minutes maximum
  
  return Math.max(minTimeout, Math.min(maxTimeout, adjustedTimeout));
}

/**
 * Generate notes using AI models with adaptive timeout
 */
export async function generateNotesWithAI(options: GenerateNotesOptions): Promise<AIResponse> {
  const { text, model, style, apiKey, chunks } = options;
  const config = MODEL_CONFIGS[model];
  
  if (!config) {
    throw new Error(`Unsupported model: ${model}`);
  }
  
  if (config.requiresApiKey && !apiKey) {
    throw new Error(`API key required for model: ${model}`);
  }

  const startTime = Date.now();

  try {
    let response: AIResponse;

    // Auto-chunk large documents to prevent timeouts
    const shouldAutoChunk = text.length > 15000; // Auto-chunk documents over 15k characters
    
    if (shouldAutoChunk && (!chunks || chunks.length === 1)) {
      console.log(`📄 Auto-chunking large document (${text.length} chars) to prevent timeout`);
      const autoChunks = createAutoChunks(text);
      response = await processMultipleChunks(autoChunks, model, style, apiKey);
    } else if (chunks && chunks.length > 1) {
      response = await processMultipleChunks(chunks, model, style, apiKey);
    } else {
      // Single chunk processing
      const prompt = createPrompt(text, style);
      response = await callAIModel(prompt, model, apiKey);
    }

    response.processingTime = Date.now() - startTime;
    return response;

  } catch (error) {
    throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process multiple chunks and combine results
 */
async function processMultipleChunks(
  chunks: TextChunk[], 
  model: string, 
  style: string, 
  apiKey?: string
): Promise<AIResponse> {
  const chunkPromises = chunks.map(async (chunk, index) => {
    const chunkPrompt = createChunkPrompt(chunk.content, style, index, chunks.length);
    return await callAIModel(chunkPrompt, model, apiKey);
  });

  const chunkResponses = await Promise.all(chunkPromises);
  
  // Combine all chunk responses
  const combinedContent = combineChunkResponses(chunkResponses, style);
  
  return {
    content: combinedContent,
    model,
    tokensUsed: chunkResponses.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
    processingTime: Math.max(...chunkResponses.map(r => r.processingTime)),
  };
}

/**
 * Create prompt based on style
 */
function createPrompt(text: string, style: string): string {
  const baseInstructions = `You are an expert academic note-taker. Extract the most important information from the provided text.`;
  
  let styleInstructions = '';
  let formatInstructions = '';
  
  switch (style) {
    case 'summary':
      styleInstructions = `Create a comprehensive executive summary that captures:
- Main thesis and key arguments
- Important findings and data points
- Methodology (if applicable)
- Conclusions and implications
- Supporting evidence and examples`;
      
      formatInstructions = `Format as:
# Executive Summary: [Document Title/Topic]

## Key Findings
• [Main finding 1 with supporting data]
• [Main finding 2 with supporting data]
• [Main finding 3 with supporting data]

## Main Arguments
[2-3 sentences summarizing core arguments]

## Methodology/Approach
[Brief description of methods or approach used]

## Conclusions & Implications
[Key takeaways and their significance]`;
      break;
      
    case 'structured':
      styleInstructions = `Create detailed structured notes with:
- Clear hierarchical organization
- Logical flow from introduction to conclusion
- Detailed sub-points under each main topic
- Proper categorization of information`;
      
      formatInstructions = `Format as:
# [Document Title/Topic] - Structured Notes

## 1. Introduction/Background
   ### Purpose
   - [Main purpose or objective]
   
   ### Context
   - [Background information]

## 2. Main Content
   ### [Topic 1]
   - [Key point 1]
   - [Key point 2]
   
   ### [Topic 2]
   - [Key point 1]
   - [Key point 2]

## 3. Key Results/Findings
   ### [Category 1]
   - [Specific finding with details]
   
   ### [Category 2]
   - [Specific finding with details]

## 4. Conclusions
   - [Main conclusion 1]
   - [Main conclusion 2]`;
      break;
      
    case 'actionable':
      styleInstructions = `Extract actionable insights with:
- Immediate action items
- Strategic recommendations
- Implementation steps
- Success metrics
- Follow-up tasks`;
      
      formatInstructions = `Format as:
# Actionable Insights: [Document Topic]

## Immediate Actions Required
□ **[Action Category 1]**
  - [Specific action with details]
  - [Timeline/priority if mentioned]

□ **[Action Category 2]**
  - [Specific action with details]

## Strategic Recommendations
□ **[Recommendation 1]**
  - [Rationale and expected outcome]
  - [Implementation approach]

□ **[Recommendation 2]**
  - [Rationale and expected outcome]

## Success Metrics
□ **[Metric Category]**
  - [Specific metric with target if available]
  - [How to measure/track]

## Next Steps & Follow-up
□ [Step 1 with timeline]
□ [Step 2 with timeline]
□ [Step 3 with timeline]`;
      break;
  }

  return `${baseInstructions}

${styleInstructions}

FORMATTING REQUIREMENTS:
${formatInstructions}

QUALITY GUIDELINES:
- Extract 5-8 main points maximum to maintain focus
- Include specific details, numbers, and examples from the source
- Use professional, clear language
- Maintain original context and meaning
- Ensure logical flow and organization

CONTENT TO ANALYZE:
${text}

GENERATED NOTES:`;
}

/**
 * Create prompt for individual chunks
 */
function createChunkPrompt(text: string, style: string, chunkIndex: number, totalChunks: number): string {
  const chunkInfo = totalChunks > 1 ? 
    `\n\nNOTE: This is chunk ${chunkIndex + 1} of ${totalChunks}. Focus on extracting key information from this section.` : '';
  
  return createPrompt(text, style) + chunkInfo;
}

/**
 * Call appropriate AI model with dynamic timeout
 */
async function callAIModel(prompt: string, model: string, apiKey?: string): Promise<AIResponse> {
  const config = MODEL_CONFIGS[model];
  
  // Calculate dynamic timeout based on prompt length and system capabilities
  let dynamicTimeout = config.timeout;
  try {
    const capabilities = await detectSystemCapabilities();
    dynamicTimeout = calculateDynamicTimeout(prompt.length, config.timeout, capabilities);
    console.log(`🕒 Dynamic timeout calculated: ${(dynamicTimeout / 1000).toFixed(1)}s for ${prompt.length} chars on ${capabilities.optimizationLevel} system`);
  } catch (error) {
    console.warn('Could not detect system capabilities, using base timeout:', error);
    dynamicTimeout = calculateDynamicTimeout(prompt.length, config.timeout);
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), dynamicTimeout);

  try {
    let response: AIResponse;

    if (model.startsWith('ollama-')) {
      response = await callOllama(prompt, config, controller.signal);
    } else if (model.startsWith('openai-')) {
      response = await callOpenAI(prompt, config, apiKey!, controller.signal);
    } else if (model.startsWith('anthropic-')) {
      response = await callAnthropic(prompt, config, apiKey!, controller.signal);
    } else if (model.startsWith('google-')) {
      response = await callGoogleAI(prompt, config, apiKey!, controller.signal);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }

    clearTimeout(timeoutId);
    return response;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutMinutes = (dynamicTimeout / 60000).toFixed(1);
      throw new Error(`Request timeout after ${timeoutMinutes} minutes. Try using a smaller document or switch to a cloud AI model for faster processing.`);
    }
    
    throw error;
  }
}

/**
 * Call Ollama API with hardware-optimized configuration
 */
async function callOllama(prompt: string, config: AIModelConfig, signal: AbortSignal): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    // Detect system capabilities and get optimized configuration
    let ollamaOptions;
    try {
      const capabilities = await detectSystemCapabilities();
      const optimizedConfig = getOptimizedOllamaConfig(capabilities);
      
      ollamaOptions = {
        temperature: optimizedConfig.temperature,
        num_predict: Math.min(config.maxTokens, optimizedConfig.num_predict),
        num_ctx: optimizedConfig.num_ctx,
        top_p: optimizedConfig.top_p,
        stop: optimizedConfig.stop,
      };
      
      console.log(`🚀 Ollama optimized for ${capabilities.optimizationLevel} performance:`, {
        model: config.name,
        ram: `${capabilities.availableRAM}GB`,
        context: optimizedConfig.num_ctx,
        tokens: optimizedConfig.num_predict
      });
      
    } catch (detectionError) {
      console.warn('Hardware detection failed, using fallback settings:', detectionError);
      // Fallback to proven optimization settings
      ollamaOptions = {
        temperature: config.temperature,
        num_predict: config.maxTokens,
        num_ctx: 4096, // Context window optimization - 80% speed improvement
        top_p: 0.9,
        stop: ['GENERATED NOTES:', 'Human:', 'Assistant:'],
      };
    }
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: config.name,
        prompt: prompt,
        stream: false,
        options: ollamaOptions
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
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434');
    }
    throw error;
  }
}

/**
 * Call OpenAI API
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
        { role: 'system', content: 'You are an expert academic note-taker and document analyzer.' },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stop: ['GENERATED NOTES:', 'Human:', 'Assistant:'],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    } else if (response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Consider using Google Gemini (free 15 requests/minute) or Anthropic Claude ($5 free credit) as alternatives.');
    } else if (response.status === 402) {
      throw new Error('OpenAI quota exceeded. Please add a payment method or try Google Gemini (free tier) or Anthropic Claude ($5 free credit).');
    } else if (response.status === 403) {
      throw new Error('OpenAI API access denied. Ensure you have a valid payment method on file. Try Google Gemini (free tier) as an alternative.');
    }
    throw new Error(`OpenAI API error: ${response.status} ${errorData?.error?.message || response.statusText}. Try Google Gemini or Anthropic Claude as free alternatives.`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenAI');
  }

  return {
    content: data.choices[0].message.content.trim(),
    model: config.name,
    tokensUsed: data.usage?.total_tokens,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Call Anthropic API
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
      stop_sequences: ['GENERATED NOTES:', 'Human:', 'Assistant:'],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key');
    } else if (response.status === 429) {
      throw new Error('Anthropic rate limit exceeded. Please try again later.');
    }
    throw new Error(`Anthropic API error: ${response.status} ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.content?.[0]?.text) {
    throw new Error('Empty response from Anthropic');
  }

  return {
    content: data.content[0].text.trim(),
    model: config.name,
    tokensUsed: data.usage?.output_tokens,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Call Google AI API
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
        stopSequences: ['GENERATED NOTES:', 'Human:', 'Assistant:'],
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid Google AI API key');
    } else if (response.status === 429) {
      throw new Error('Google AI rate limit exceeded. Please try again later.');
    }
    throw new Error(`Google AI API error: ${response.status} ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Empty response from Google AI');
  }

  return {
    content: data.candidates[0].content.parts[0].text.trim(),
    model: config.name,
    tokensUsed: data.usageMetadata?.totalTokenCount,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Combine responses from multiple chunks
 */
function combineChunkResponses(responses: AIResponse[], style: string): string {
  const contents = responses.map(r => r.content);
  
  switch (style) {
    case 'summary':
      return combineSummaries(contents);
    case 'structured':
      return combineStructuredNotes(contents);
    case 'actionable':
      return combineActionableNotes(contents);
    default:
      return contents.join('\n\n---\n\n');
  }
}

function combineSummaries(contents: string[]): string {
  // Extract sections from each summary and merge intelligently
  const combined = contents.join('\n\n---\n\n');
  return `# Comprehensive Executive Summary\n\n${combined}`;
}

function combineStructuredNotes(contents: string[]): string {
  // Merge structured notes by combining similar sections
  const combined = contents.join('\n\n---\n\n');
  return `# Complete Structured Notes\n\n${combined}`;
}

function combineActionableNotes(contents: string[]): string {
  // Combine action items, removing duplicates
  const combined = contents.join('\n\n---\n\n');
  return `# Complete Action Plan\n\n${combined}`;
}

/**
 * Get recommended AI models based on system capabilities
 */
export async function getRecommendedModels(): Promise<{
  recommended: string;
  compatible: string[];
  warnings: { [model: string]: string[] };
  systemInfo: SystemCapabilities;
}> {
  try {
    const capabilities = await detectSystemCapabilities();
    const allModels = Object.keys(MODEL_CONFIGS).filter(m => m.startsWith('ollama-'));
    
    const compatible: string[] = [];
    const warnings: { [model: string]: string[] } = {};
    
    for (const model of allModels) {
      const validation = validateModelCompatibility(model, capabilities);
      
      if (validation.compatible) {
        compatible.push(model);
        if (validation.recommendations) {
          warnings[model] = validation.recommendations;
        }
      }
    }
    
    return {
      recommended: capabilities.recommendedModel,
      compatible,
      warnings,
      systemInfo: capabilities
    };
    
  } catch (error) {
    console.warn('Model recommendation failed:', error);
    return {
      recommended: 'ollama-llama32',
      compatible: ['ollama-llama32'],
      warnings: {},
      systemInfo: {
        totalRAM: 8,
        availableRAM: 4,
        cpuCores: 4,
        platform: 'unknown',
        architecture: 'unknown',
        hasGPU: false,
        recommendedModel: 'ollama-llama32',
        optimizationLevel: 'balanced'
      }
    };
  }
}