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
  "claude",
  "google",
  "azure",
  "cohere",
  "huggingface"
];
var DEFAULT_MODELS = {
  openai: "gpt-4o",
  claude: "claude-3-5-sonnet-20241022",
  google: "gemini-pro",
  azure: "gpt-4",
  cohere: "command-r-plus",
  huggingface: "meta-llama/Llama-2-70b-chat-hf"
};
var PROVIDER_CAPABILITIES = {
  openai: {
    chat: true,
    images: true,
    embeddings: true,
    tools: true,
    streaming: true,
    vision: true,
    maxTokens: 128e3,
    costPer1kTokens: { input: 0.01, output: 0.03 }
  },
  claude: {
    chat: true,
    images: false,
    embeddings: false,
    tools: true,
    streaming: true,
    vision: true,
    maxTokens: 2e5,
    costPer1kTokens: { input: 3e-3, output: 0.015 }
  },
  google: {
    chat: true,
    images: false,
    embeddings: true,
    tools: true,
    streaming: true,
    vision: true,
    maxTokens: 1e6,
    costPer1kTokens: { input: 125e-6, output: 375e-6 }
  },
  azure: {
    chat: true,
    images: true,
    embeddings: true,
    tools: true,
    streaming: true,
    vision: true,
    maxTokens: 128e3,
    costPer1kTokens: { input: 0.01, output: 0.03 }
  },
  cohere: {
    chat: true,
    images: false,
    embeddings: true,
    tools: true,
    streaming: true,
    vision: false,
    maxTokens: 128e3,
    costPer1kTokens: { input: 15e-4, output: 2e-3 }
  },
  huggingface: {
    chat: true,
    images: false,
    embeddings: true,
    tools: false,
    streaming: true,
    vision: false,
    maxTokens: 4096,
    costPer1kTokens: { input: 2e-4, output: 2e-4 }
  }
};

export { DEFAULT_MODELS, PROVIDER_CAPABILITIES, SUPPORTED_PROVIDERS, isAuthenticationError, isRateLimitError, isSDKError, isValidationError };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map