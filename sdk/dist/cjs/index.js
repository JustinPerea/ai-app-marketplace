"use strict";
/**
 * AI Marketplace SDK
 *
 * A TypeScript SDK for intelligent AI provider routing with ML-powered optimization
 * Supports OpenAI, Anthropic, and Google AI with zero external dependencies
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.COST_THRESHOLDS = exports.PERFORMANCE_TARGETS = exports.DEFAULT_CACHE_CONFIG = exports.DEFAULT_ROUTER_CONFIG = exports.MODEL_EQUIVALENTS = exports.RequestType = exports.APIProvider = exports.MLIntelligentRouter = exports.BaseAIProvider = exports.GoogleProvider = exports.AnthropicProvider = exports.OpenAIProvider = exports.AIMarketplaceClient = void 0;
exports.createClient = createClient;
// Main client
var client_1 = require("./client");
Object.defineProperty(exports, "AIMarketplaceClient", { enumerable: true, get: function () { return client_1.AIMarketplaceClient; } });
// Core types and interfaces
__exportStar(require("./types"), exports);
// Provider implementations
var openai_1 = require("./providers/openai");
Object.defineProperty(exports, "OpenAIProvider", { enumerable: true, get: function () { return openai_1.OpenAIProvider; } });
var anthropic_1 = require("./providers/anthropic");
Object.defineProperty(exports, "AnthropicProvider", { enumerable: true, get: function () { return anthropic_1.AnthropicProvider; } });
var google_1 = require("./providers/google");
Object.defineProperty(exports, "GoogleProvider", { enumerable: true, get: function () { return google_1.GoogleProvider; } });
var base_1 = require("./providers/base");
Object.defineProperty(exports, "BaseAIProvider", { enumerable: true, get: function () { return base_1.BaseAIProvider; } });
// ML routing
var router_1 = require("./ml/router");
Object.defineProperty(exports, "MLIntelligentRouter", { enumerable: true, get: function () { return router_1.MLIntelligentRouter; } });
// Constants
var types_1 = require("./types");
Object.defineProperty(exports, "APIProvider", { enumerable: true, get: function () { return types_1.APIProvider; } });
Object.defineProperty(exports, "RequestType", { enumerable: true, get: function () { return types_1.RequestType; } });
Object.defineProperty(exports, "MODEL_EQUIVALENTS", { enumerable: true, get: function () { return types_1.MODEL_EQUIVALENTS; } });
Object.defineProperty(exports, "DEFAULT_ROUTER_CONFIG", { enumerable: true, get: function () { return types_1.DEFAULT_ROUTER_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_CACHE_CONFIG", { enumerable: true, get: function () { return types_1.DEFAULT_CACHE_CONFIG; } });
Object.defineProperty(exports, "PERFORMANCE_TARGETS", { enumerable: true, get: function () { return types_1.PERFORMANCE_TARGETS; } });
Object.defineProperty(exports, "COST_THRESHOLDS", { enumerable: true, get: function () { return types_1.COST_THRESHOLDS; } });
// Import the client class and types
const client_2 = require("./client");
// Convenience factory function
function createClient(options) {
    return new client_2.AIMarketplaceClient(options);
}
// Version
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map