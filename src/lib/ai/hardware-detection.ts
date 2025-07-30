/**
 * Hardware Detection and Optimization for AI Marketplace
 * Provides universal optimization strategies for any hardware configuration
 */

export interface SystemCapabilities {
  totalRAM: number; // GB
  availableRAM: number; // GB
  cpuCores: number;
  platform: 'darwin' | 'linux' | 'win32' | 'unknown';
  architecture: 'x64' | 'arm64' | 'arm' | 'unknown';
  hasGPU: boolean;
  gpuMemory?: number; // GB
  recommendedModel: string;
  optimizationLevel: 'minimal' | 'balanced' | 'performance';
}

export interface ModelRequirements {
  name: string;
  minRAM: number; // GB
  recommendedRAM: number; // GB
  modelSize: number; // GB
  contextWindow: number;
  maxTokens: number;
  timeout: number; // ms
  performance: 'fast' | 'medium' | 'slow';
}

// Model configurations based on hardware requirements
export const OLLAMA_MODELS: { [key: string]: ModelRequirements } = {
  'llama3.2:1b': {
    name: 'llama3.2:1b',
    minRAM: 2,
    recommendedRAM: 4,
    modelSize: 1.3,
    contextWindow: 2048,
    maxTokens: 1024,
    timeout: 30000,
    performance: 'fast'
  },
  'llama3.2:3b': {
    name: 'llama3.2:3b',
    minRAM: 4,
    recommendedRAM: 8,
    modelSize: 2.0,
    contextWindow: 4096,
    maxTokens: 2048,
    timeout: 60000,
    performance: 'medium'
  },
  'llama3.3:8b': {
    name: 'llama3.3:8b',
    minRAM: 8,
    recommendedRAM: 16,
    modelSize: 4.7,
    contextWindow: 8192,
    maxTokens: 4096,
    timeout: 120000,
    performance: 'medium'
  },
  'llama3:13b': {
    name: 'llama3:13b',
    minRAM: 16,
    recommendedRAM: 32,
    modelSize: 7.3,
    contextWindow: 8192,
    maxTokens: 4096,
    timeout: 180000,
    performance: 'slow'
  }
};

/**
 * Detect system capabilities in browser environment
 */
export async function detectSystemCapabilities(): Promise<SystemCapabilities> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Server-side environment detected, using server-side capabilities detection');
      return getServerSideCapabilities();
    }

    // Browser-based detection
    const navigator = window.navigator;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Platform detection
    let platform: SystemCapabilities['platform'] = 'unknown';
    if (userAgent.includes('mac')) platform = 'darwin';
    else if (userAgent.includes('linux')) platform = 'linux';
    else if (userAgent.includes('win')) platform = 'win32';
    
    // Architecture detection (approximate)
    let architecture: SystemCapabilities['architecture'] = 'unknown';
    if (navigator.userAgent.includes('ARM') || navigator.userAgent.includes('arm64')) {
      architecture = 'arm64';
    } else if (navigator.userAgent.includes('x64') || navigator.userAgent.includes('x86_64')) {
      architecture = 'x64';
    }
    
    // Memory estimation (approximate from device memory API)
    const deviceMemory = (navigator as any).deviceMemory || 4; // GB, fallback to 4GB
    const estimatedRAM = deviceMemory;
    const availableRAM = Math.max(1, estimatedRAM * 0.6); // Conservative estimate
    
    // CPU cores
    const cpuCores = navigator.hardwareConcurrency || 4;
    
    // GPU detection (basic) - only in browser
    let hasGPU = false;
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        hasGPU = !!gl;
      }
    } catch (error) {
      console.warn('GPU detection failed:', error);
      hasGPU = false;
    }
    
    // Determine optimization level and recommended model
    const { recommendedModel, optimizationLevel } = determineOptimalConfiguration({
      totalRAM: estimatedRAM,
      availableRAM,
      cpuCores,
      platform,
      architecture,
      hasGPU
    });
    
    return {
      totalRAM: estimatedRAM,
      availableRAM,
      cpuCores,
      platform,
      architecture,
      hasGPU,
      recommendedModel,
      optimizationLevel
    };
    
  } catch (error) {
    console.warn('Hardware detection failed, using fallback configuration:', error);
    return getFallbackConfiguration();
  }
}

/**
 * Determine optimal configuration based on system capabilities
 */
function determineOptimalConfiguration(capabilities: Partial<SystemCapabilities>) {
  const { availableRAM = 4, cpuCores = 4, platform, architecture } = capabilities;
  
  let recommendedModel = 'llama3.2:3b'; // Default
  let optimizationLevel: SystemCapabilities['optimizationLevel'] = 'balanced';
  
  // High-end systems (16GB+ RAM)
  if (availableRAM >= 16) {
    recommendedModel = 'llama3.3:8b';
    optimizationLevel = 'performance';
  }
  // Mid-range systems (8-16GB RAM)
  else if (availableRAM >= 8) {
    recommendedModel = 'llama3.2:3b';
    optimizationLevel = 'balanced';
  }
  // Low-end systems (4-8GB RAM)
  else if (availableRAM >= 4) {
    recommendedModel = 'llama3.2:3b';
    optimizationLevel = 'balanced';
  }
  // Very low-end systems (<4GB RAM)
  else {
    recommendedModel = 'llama3.2:1b';
    optimizationLevel = 'minimal';
  }
  
  // Apple Silicon optimization
  if (platform === 'darwin' && architecture === 'arm64') {
    // Apple Silicon can handle larger models more efficiently
    if (availableRAM >= 8 && recommendedModel === 'llama3.2:3b') {
      optimizationLevel = 'performance';
    }
  }
  
  return { recommendedModel, optimizationLevel };
}

/**
 * Get server-side system capabilities using Node.js APIs
 */
function getServerSideCapabilities(): SystemCapabilities {
  try {
    // Try to import Node.js modules if available
    if (typeof process !== 'undefined') {
      const platform = process.platform as SystemCapabilities['platform'];
      const architecture = process.arch as SystemCapabilities['architecture'];
      
      // Estimate system capabilities based on platform
      let estimatedRAM = 8; // Default assumption
      let cpuCores = 4; // Default assumption
      
      // Use process.env or other hints if available
      if (process.env.NODE_ENV === 'development') {
        // Development environments often have more resources
        estimatedRAM = 16;
        cpuCores = 8;
      }
      
      const availableRAM = Math.max(1, estimatedRAM * 0.6);
      
      const { recommendedModel, optimizationLevel } = determineOptimalConfiguration({
        totalRAM: estimatedRAM,
        availableRAM,
        cpuCores,
        platform,
        architecture,
        hasGPU: false // Conservative assumption for server-side
      });
      
      return {
        totalRAM: estimatedRAM,
        availableRAM,
        cpuCores,
        platform,
        architecture,
        hasGPU: false,
        recommendedModel,
        optimizationLevel
      };
    }
  } catch (error) {
    console.warn('Server-side hardware detection failed:', error);
  }
  
  // Fallback to safe defaults
  return getFallbackConfiguration();
}

/**
 * Get fallback configuration for unknown systems
 */
function getFallbackConfiguration(): SystemCapabilities {
  return {
    totalRAM: 8,
    availableRAM: 4,
    cpuCores: 4,
    platform: 'unknown',
    architecture: 'unknown',
    hasGPU: false,
    recommendedModel: 'llama3.2:3b',
    optimizationLevel: 'balanced'
  };
}

/**
 * Get optimized Ollama configuration based on system capabilities
 */
export function getOptimizedOllamaConfig(capabilities: SystemCapabilities) {
  const model = OLLAMA_MODELS[capabilities.recommendedModel];
  
  if (!model) {
    throw new Error(`Unknown model: ${capabilities.recommendedModel}`);
  }
  
  // Base configuration
  let config = {
    model: model.name,
    num_ctx: model.contextWindow,
    num_predict: model.maxTokens,
    timeout: model.timeout,
    temperature: 0.3,
    top_p: 0.9,
    stop: ['GENERATED NOTES:', 'Human:', 'Assistant:']
  };
  
  // Optimization level adjustments
  switch (capabilities.optimizationLevel) {
    case 'minimal':
      config.num_ctx = Math.min(config.num_ctx, 2048);
      config.num_predict = Math.min(config.num_predict, 512);
      config.timeout = Math.min(config.timeout, 45000);
      break;
      
    case 'performance':
      // Use full capabilities
      if (capabilities.hasGPU) {
        config.num_ctx = Math.max(config.num_ctx, 4096);
      }
      break;
      
    case 'balanced':
    default:
      // Use optimized settings from research
      config.num_ctx = 4096; // 80% speed improvement
      break;
  }
  
  return config;
}

/**
 * Validate if a model can run on the current system
 */
export function validateModelCompatibility(
  modelName: string, 
  capabilities: SystemCapabilities
): { compatible: boolean; reason?: string; recommendations?: string[] } {
  const model = OLLAMA_MODELS[modelName];
  
  if (!model) {
    return {
      compatible: false,
      reason: `Unknown model: ${modelName}`,
      recommendations: ['Use a supported model from the marketplace']
    };
  }
  
  const recommendations: string[] = [];
  
  // Check RAM requirements
  if (capabilities.availableRAM < model.minRAM) {
    return {
      compatible: false,
      reason: `Insufficient RAM: ${capabilities.availableRAM}GB available, ${model.minRAM}GB required`,
      recommendations: [
        `Try ${getSmallerModel(modelName)} for better performance`,
        'Close other applications to free up memory',
        'Consider upgrading your system RAM'
      ]
    };
  }
  
  // Performance warnings
  if (capabilities.availableRAM < model.recommendedRAM) {
    recommendations.push(
      `Performance may be slower with ${capabilities.availableRAM}GB RAM (${model.recommendedRAM}GB recommended)`,
      'Consider closing other applications for better performance'
    );
  }
  
  if (capabilities.cpuCores < 4 && model.performance === 'slow') {
    recommendations.push(
      'This model may be slow on systems with fewer than 4 CPU cores',
      `Consider using ${getSmallerModel(modelName)} for faster responses`
    );
  }
  
  return {
    compatible: true,
    recommendations: recommendations.length > 0 ? recommendations : undefined
  };
}

/**
 * Get a smaller model recommendation
 */
function getSmallerModel(currentModel: string): string {
  const sizeOrder = ['llama3.2:1b', 'llama3.2:3b', 'llama3.3:8b', 'llama3:13b'];
  const currentIndex = sizeOrder.indexOf(currentModel);
  
  if (currentIndex > 0) {
    return sizeOrder[currentIndex - 1];
  }
  
  return 'llama3.2:1b'; // Smallest available
}

/**
 * Get performance estimates for a model on current system
 */
export function getPerformanceEstimate(
  modelName: string,
  capabilities: SystemCapabilities
): {
  estimatedResponseTime: number; // seconds
  memoryUsage: number; // GB
  confidence: 'high' | 'medium' | 'low';
} {
  const model = OLLAMA_MODELS[modelName];
  
  if (!model) {
    return {
      estimatedResponseTime: 60,
      memoryUsage: 4,
      confidence: 'low'
    };
  }
  
  // Base performance estimates
  let baseTime = 30; // seconds for medium-end system
  
  // Adjust for model size
  if (model.performance === 'fast') baseTime *= 0.5;
  else if (model.performance === 'slow') baseTime *= 2;
  
  // Adjust for system capabilities
  const ramFactor = capabilities.availableRAM / model.recommendedRAM;
  const cpuFactor = capabilities.cpuCores / 4; // Baseline 4 cores
  
  let adjustedTime = baseTime;
  adjustedTime *= Math.max(0.5, Math.min(2, 1 / ramFactor)); // RAM impact
  adjustedTime *= Math.max(0.5, Math.min(2, 1 / cpuFactor)); // CPU impact
  
  // Apple Silicon boost
  if (capabilities.platform === 'darwin' && capabilities.architecture === 'arm64') {
    adjustedTime *= 0.7; // 30% faster on Apple Silicon
  }
  
  // GPU acceleration
  if (capabilities.hasGPU && model.modelSize > 2) {
    adjustedTime *= 0.6; // 40% faster with GPU
  }
  
  // Confidence based on how well we know the system
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (capabilities.platform !== 'unknown' && capabilities.totalRAM > 0) {
    confidence = 'high';
  } else if (capabilities.totalRAM === 0) {
    confidence = 'low';
  }
  
  return {
    estimatedResponseTime: Math.round(adjustedTime),
    memoryUsage: model.modelSize + 1, // Model + overhead
    confidence
  };
}