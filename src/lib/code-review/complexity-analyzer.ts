/**
 * Code Complexity Analysis and Provider Optimization
 * Analyzes code complexity to determine optimal AI provider for cost and quality balance
 */

export type CodeComplexity = 'simple' | 'moderate' | 'complex';
export type ReviewType = 'security' | 'performance' | 'quality' | 'comprehensive';
export type ProviderPreference = 'cost-optimized' | 'quality-optimized' | 'balanced';

export interface ProviderSelection {
  provider: string;
  reason: string;
  estimatedCost: number;
  costReason: string;
  alternatives: Array<{
    provider: string;
    cost: number;
    reason: string;
  }>;
  potentialSavings?: string;
}

export interface OptimizationOptions {
  complexity: CodeComplexity;
  estimatedTokens: number;
  reviewType: ReviewType;
  preference: ProviderPreference;
  customProvider?: string;
  hasApiKey: boolean;
}

// Cost per 1K tokens for different providers (updated 2024 pricing)
const PROVIDER_COSTS = {
  'ollama-llama32': 0.0000, // Free local processing
  'ollama-llama33': 0.0000, // Free local processing
  'google-gemini': 0.0001, // Google Gemini Flash - very competitive
  'anthropic-claude': 0.0003, // Claude Haiku
  'openai-gpt4': 0.0100, // GPT-4o
  'openai-gpt35': 0.0005, // GPT-3.5 Turbo
} as const;

// Provider quality scores for different types of analysis
const PROVIDER_QUALITY = {
  security: {
    'openai-gpt4': 9.5,
    'anthropic-claude': 9.2,
    'google-gemini': 8.0,
    'ollama-llama33': 7.5,
    'ollama-llama32': 7.0,
  },
  performance: {
    'anthropic-claude': 9.3,
    'openai-gpt4': 9.0,
    'google-gemini': 8.2,
    'ollama-llama33': 7.8,
    'ollama-llama32': 7.2,
  },
  quality: {
    'openai-gpt4': 9.4,
    'anthropic-claude': 9.1,
    'google-gemini': 8.3,
    'ollama-llama33': 7.6,
    'ollama-llama32': 7.1,
  },
  comprehensive: {
    'openai-gpt4': 9.6,
    'anthropic-claude': 9.4,
    'google-gemini': 8.5,
    'ollama-llama33': 8.0,
    'ollama-llama32': 7.5,
  },
} as const;

/**
 * Detect code complexity based on various metrics
 */
export function detectCodeComplexity(code: string, language: string): CodeComplexity {
  const lines = code.split('\n').length;
  const codeLength = code.length;
  
  // Count complexity indicators
  let complexityScore = 0;
  
  // Line count factor
  if (lines > 200) complexityScore += 3;
  else if (lines > 100) complexityScore += 2;
  else if (lines > 50) complexityScore += 1;
  
  // Code length factor
  if (codeLength > 10000) complexityScore += 3;
  else if (codeLength > 5000) complexityScore += 2;
  else if (codeLength > 2000) complexityScore += 1;
  
  // Language-specific complexity patterns
  const complexPatterns = getComplexityPatterns(language);
  
  for (const pattern of complexPatterns) {
    const matches = (code.match(new RegExp(pattern.regex, 'g')) || []).length;
    complexityScore += matches * pattern.weight;
  }
  
  // Cyclomatic complexity approximation
  const cyclomaticIndicators = [
    /\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, 
    /\bswitch\b/g, /\bcatch\b/g, /\btry\b/g, /\?\s*:/g
  ];
  
  for (const indicator of cyclomaticIndicators) {
    const matches = (code.match(indicator) || []).length;
    complexityScore += matches * 0.5;
  }
  
  // Security complexity indicators
  const securityPatterns = [
    /password|secret|key|token/gi,
    /sql|query|database/gi,
    /auth|login|session/gi,
    /crypto|encrypt|decrypt/gi,
    /eval|exec|system/gi
  ];
  
  for (const pattern of securityPatterns) {
    const matches = (code.match(pattern) || []).length;
    complexityScore += matches * 0.3;
  }
  
  // Determine complexity level
  if (complexityScore >= 15) return 'complex';
  if (complexityScore >= 8) return 'moderate';
  return 'simple';
}

/**
 * Get language-specific complexity patterns
 */
function getComplexityPatterns(language: string) {
  const patterns = {
    javascript: [
      { regex: '\\basync\\b|\\bawait\\b', weight: 1 },
      { regex: '\\bPromise\\b|\\.then\\(|\\.catch\\(', weight: 1 },
      { regex: 'class\\s+\\w+|function\\*', weight: 0.5 },
      { regex: '\\breact|\\buseEffect|\\buseState', weight: 0.5 },
      { regex: '\\bimport\\b|\\brequire\\(', weight: 0.2 },
    ],
    python: [
      { regex: '\\bdef\\s+\\w+|\\bclass\\s+\\w+', weight: 0.5 },
      { regex: '\\basync\\s+def|\\bawait\\b', weight: 1 },
      { regex: '\\btry:|\\bexcept:|\\bfinally:', weight: 0.8 },
      { regex: '\\bwith\\s+\\w+|\\byield\\b', weight: 0.7 },
      { regex: 'import\\s+\\w+|from\\s+\\w+', weight: 0.2 },
    ],
    java: [
      { regex: 'public\\s+class|private\\s+class', weight: 0.5 },
      { regex: '\\binterface\\b|\\babstract\\b', weight: 0.8 },
      { regex: '\\bsynchronized\\b|\\bvolatile\\b', weight: 1 },
      { regex: '\\btry\\s*\\{|\\bcatch\\s*\\(', weight: 0.8 },
      { regex: '@\\w+|\\bannotation\\b', weight: 0.3 },
    ],
    default: [
      { regex: '\\bfunction\\b|\\bmethod\\b|\\bclass\\b', weight: 0.5 },
      { regex: '\\btry\\b|\\bcatch\\b|\\bfinally\\b', weight: 0.8 },
      { regex: '\\bif\\b|\\belse\\b|\\bswitch\\b', weight: 0.3 },
    ]
  };
  
  return patterns[language as keyof typeof patterns] || patterns.default;
}

/**
 * Estimate token count for code analysis
 */
export function estimateCodeTokens(code: string, language: string): number {
  // Base token estimation (roughly 1 token per 3-4 characters)
  const baseTokens = Math.ceil(code.length / 3.5);
  
  // Language-specific adjustments
  const languageMultipliers = {
    javascript: 1.1, // Slightly more verbose
    typescript: 1.2, // Type annotations add tokens
    python: 0.9,     // Generally more concise
    java: 1.3,       // Verbose syntax
    csharp: 1.2,     // Similar to Java
    go: 1.0,         // Balanced
    rust: 1.1,       // Some verbosity
    php: 1.0,        // Balanced
    ruby: 0.9,       // Concise syntax
    default: 1.0
  };
  
  const multiplier = languageMultipliers[language as keyof typeof languageMultipliers] || 1.0;
  
  // Add tokens for complexity (imports, functions, classes, etc.)
  const complexityBonus = Math.ceil(baseTokens * 0.1);
  
  return Math.ceil((baseTokens * multiplier) + complexityBonus);
}

/**
 * Calculate optimal provider based on complexity, cost, and quality requirements
 */
export function calculateOptimalProvider(options: OptimizationOptions): ProviderSelection {
  const { complexity, estimatedTokens, reviewType, preference, customProvider, hasApiKey } = options;
  
  // If custom provider specified, validate and use it
  if (customProvider) {
    return validateCustomProvider(customProvider, estimatedTokens, hasApiKey);
  }
  
  // Get available providers based on API key availability
  const availableProviders = getAvailableProviders(hasApiKey);
  
  // Calculate scores for each provider
  const providerScores = availableProviders.map(provider => {
    const cost = calculateCost(provider, estimatedTokens);
    const quality = PROVIDER_QUALITY[reviewType][provider as keyof typeof PROVIDER_QUALITY[typeof reviewType]];
    
    let score = 0;
    let reason = '';
    
    switch (preference) {
      case 'cost-optimized':
        // Prioritize cost, but ensure minimum quality
        score = quality >= 7.0 ? (10 - (cost * 10000)) : 0; // Heavily favor low cost
        reason = `Cost-optimized: $${cost.toFixed(4)} per analysis`;
        break;
        
      case 'quality-optimized':
        // Prioritize quality regardless of cost
        score = quality;
        reason = `Quality-optimized: ${quality}/10 quality score`;
        break;
        
      case 'balanced':
      default:
        // Balance cost and quality based on complexity
        const costWeight = complexity === 'simple' ? 0.7 : complexity === 'moderate' ? 0.5 : 0.3;
        const qualityWeight = 1 - costWeight;
        
        const costScore = cost === 0 ? 10 : Math.max(0, 10 - (cost * 5000)); // Scale cost to 0-10
        const qualityScore = quality;
        
        score = (costScore * costWeight) + (qualityScore * qualityWeight);
        reason = `Balanced: ${(qualityScore * qualityWeight).toFixed(1)} quality + ${(costScore * costWeight).toFixed(1)} value = ${score.toFixed(1)} total`;
        break;
    }
    
    return {
      provider,
      score,
      cost,
      quality,
      reason
    };
  });
  
  // Sort by score (descending)
  providerScores.sort((a, b) => b.score - a.score);
  
  const selectedProvider = providerScores[0];
  const alternatives = providerScores.slice(1, 4).map(p => ({
    provider: p.provider,
    cost: p.cost,
    reason: `${p.quality}/10 quality, $${p.cost.toFixed(4)} cost`
  }));
  
  // Calculate potential savings
  const mostExpensive = Math.max(...providerScores.map(p => p.cost));
  const potentialSavings = selectedProvider.cost === 0 
    ? `Save $${mostExpensive.toFixed(4)} vs most expensive option`
    : mostExpensive > selectedProvider.cost 
      ? `Save $${(mostExpensive - selectedProvider.cost).toFixed(4)} vs most expensive option`
      : undefined;
  
  return {
    provider: selectedProvider.provider,
    reason: selectedProvider.reason,
    estimatedCost: selectedProvider.cost,
    costReason: getCostReason(selectedProvider.provider, complexity, reviewType),
    alternatives,
    potentialSavings
  };
}

/**
 * Get available providers based on API key availability
 */
function getAvailableProviders(hasApiKey: boolean): string[] {
  const localProviders = ['ollama-llama32', 'ollama-llama33'];
  const cloudProviders = ['google-gemini', 'anthropic-claude', 'openai-gpt4'];
  
  return hasApiKey ? [...localProviders, ...cloudProviders] : localProviders;
}

/**
 * Calculate cost for a provider based on estimated tokens
 */
function calculateCost(provider: string, estimatedTokens: number): number {
  const costPer1K = PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS] || 0;
  return (estimatedTokens / 1000) * costPer1K;
}

/**
 * Validate custom provider selection
 */
function validateCustomProvider(provider: string, estimatedTokens: number, hasApiKey: boolean): ProviderSelection {
  const cost = calculateCost(provider, estimatedTokens);
  const requiresApiKey = !provider.startsWith('ollama-');
  
  if (requiresApiKey && !hasApiKey) {
    throw new Error(`API key required for provider: ${provider}`);
  }
  
  return {
    provider,
    reason: 'Custom provider selection',
    estimatedCost: cost,
    costReason: `Custom selection: $${cost.toFixed(4)} estimated cost`,
    alternatives: [],
  };
}

/**
 * Get cost reasoning explanation
 */
function getCostReason(provider: string, complexity: CodeComplexity, reviewType: ReviewType): string {
  if (provider.startsWith('ollama-')) {
    return `Free local processing - unlimited use with no API costs`;
  }
  
  const costPer1K = PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS];
  const providerName = provider.replace(/^(google|anthropic|openai)-/, '');
  
  switch (complexity) {
    case 'simple':
      return `${providerName.toUpperCase()} - excellent for simple ${reviewType} analysis at $${costPer1K}/1K tokens`;
    case 'moderate':
      return `${providerName.toUpperCase()} - good balance for moderate complexity ${reviewType} review`;
    case 'complex':
      return `${providerName.toUpperCase()} - recommended for complex ${reviewType} analysis requiring deep understanding`;
    default:
      return `${providerName.toUpperCase()} selected for ${reviewType} analysis`;
  }
}