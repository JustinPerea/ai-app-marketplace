'use strict';

// src/types/index.ts
function isSDKError(error) {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string";
}
function isRateLimitError(error) {
  return isSDKError(error) && error.code === "RATE_LIMIT_EXCEEDED";
}
function isAuthenticationError(error) {
  return isSDKError(error) && error.code === "AUTHENTICATION_FAILED";
}
function isValidationError(error) {
  return isSDKError(error) && error.code === "VALIDATION_ERROR";
}
var SUPPORTED_PROVIDERS = [
  "openai",
  "anthropic",
  "claude",
  "google",
  "azure",
  "cohere",
  "huggingface"
];
var DEFAULT_MODELS = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  claude: "claude-3-5-sonnet-20241022",
  google: "gemini-pro",
  azure: "gpt-4",
  cohere: "command-r-plus",
  huggingface: "meta-llama/Llama-2-70b-chat-hf"
};
var PROVIDER_CAPABILITIES = {
  openai: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: true,
    imageAnalysis: true,
    jsonMode: true,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128e3,
    supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
  },
  anthropic: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 2e5,
    supportedModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
  },
  claude: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 2e5,
    supportedModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
  },
  google: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: false,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: false,
    toolUse: false,
    multipleMessages: true,
    maxContextTokens: 1e6,
    supportedModels: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro", "gemini-pro-vision"]
  },
  azure: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: true,
    imageAnalysis: true,
    jsonMode: true,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128e3,
    supportedModels: ["gpt-4", "gpt-3.5-turbo"]
  },
  cohere: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: false,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128e3,
    supportedModels: ["command-r-plus", "command-r"]
  },
  huggingface: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: false,
    imageGeneration: false,
    imageAnalysis: false,
    jsonMode: false,
    systemMessages: true,
    toolUse: false,
    multipleMessages: true,
    maxContextTokens: 4096,
    supportedModels: ["meta-llama/Llama-2-70b-chat-hf"]
  }
};

exports.DEFAULT_MODELS = DEFAULT_MODELS;
exports.PROVIDER_CAPABILITIES = PROVIDER_CAPABILITIES;
exports.SUPPORTED_PROVIDERS = SUPPORTED_PROVIDERS;
exports.isAuthenticationError = isAuthenticationError;
exports.isRateLimitError = isRateLimitError;
exports.isSDKError = isSDKError;
exports.isValidationError = isValidationError;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map