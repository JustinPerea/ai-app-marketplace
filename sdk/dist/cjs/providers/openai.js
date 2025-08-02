"use strict";
/**
 * OpenAI Provider Implementation
 *
 * Implements OpenAI API integration with support for:
 * - GPT-3.5 and GPT-4 models
 * - Streaming responses
 * - Function calling
 * - Cost optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const base_1 = require("./base");
const types_1 = require("../types");
class OpenAIProvider extends base_1.BaseAIProvider {
    constructor() {
        super(...arguments);
        this.provider = types_1.APIProvider.OPENAI;
        this.baseUrl = 'https://api.openai.com/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Marketplace-SDK/1.0',
        };
        this.models = [
            {
                id: 'gpt-3.5-turbo',
                provider: types_1.APIProvider.OPENAI,
                name: 'gpt-3.5-turbo',
                displayName: 'GPT-3.5 Turbo',
                description: 'Fast, cost-effective model for most conversational tasks',
                maxTokens: 4096,
                inputCostPer1K: 0.0015,
                outputCostPer1K: 0.002,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 16385,
                isActive: true,
            },
            {
                id: 'gpt-4',
                provider: types_1.APIProvider.OPENAI,
                name: 'gpt-4',
                displayName: 'GPT-4',
                description: 'Most capable model for complex reasoning tasks',
                maxTokens: 8192,
                inputCostPer1K: 0.03,
                outputCostPer1K: 0.06,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 8192,
                isActive: true,
            },
            {
                id: 'gpt-4-turbo',
                provider: types_1.APIProvider.OPENAI,
                name: 'gpt-4-turbo-preview',
                displayName: 'GPT-4 Turbo',
                description: 'Latest GPT-4 model with improved speed and cost efficiency',
                maxTokens: 4096,
                inputCostPer1K: 0.01,
                outputCostPer1K: 0.03,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 128000,
                isActive: true,
            },
            {
                id: 'gpt-4o',
                provider: types_1.APIProvider.OPENAI,
                name: 'gpt-4o',
                displayName: 'GPT-4 Omni',
                description: 'Multimodal model with vision capabilities',
                maxTokens: 4096,
                inputCostPer1K: 0.005,
                outputCostPer1K: 0.015,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 128000,
                isActive: true,
            },
            {
                id: 'gpt-4o-mini',
                provider: types_1.APIProvider.OPENAI,
                name: 'gpt-4o-mini',
                displayName: 'GPT-4 Omni Mini',
                description: 'Efficient and cost-effective model for simple tasks',
                maxTokens: 16384,
                inputCostPer1K: 0.00015,
                outputCostPer1K: 0.0006,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 128000,
                isActive: true,
            },
        ];
    }
    getAuthHeaders(apiKey) {
        return {
            'Authorization': `Bearer ${apiKey}`,
        };
    }
    async getModels() {
        return this.models.filter(model => model.isActive);
    }
    async validateApiKey(apiKey) {
        try {
            const response = await this.makeRequest(`${this.baseUrl}/models`, { method: 'GET' }, apiKey);
            return response.data && response.data.length > 0;
        }
        catch (error) {
            if (error instanceof types_1.AIError && error.type === 'authentication') {
                return false;
            }
            throw error;
        }
    }
    async chat(request, apiKey) {
        const openaiRequest = this.transformRequest(request);
        const response = await this.makeRequest(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            body: JSON.stringify(openaiRequest),
        }, apiKey);
        return this.transformResponse(response, request);
    }
    async *chatStream(request, apiKey) {
        const openaiRequest = this.transformRequest(request, true);
        const stream = await this.makeStreamRequest(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            body: JSON.stringify(openaiRequest),
        }, apiKey);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '' || trimmed === 'data: [DONE]')
                        continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmed.slice(6));
                            const chunk = this.transformStreamChunk(data, request);
                            if (chunk)
                                yield chunk;
                        }
                        catch (e) {
                            // Skip malformed chunks
                            continue;
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    transformRequest(request, stream = false) {
        const openaiRequest = {
            model: request.model,
            messages: request.messages.map(msg => ({
                role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
                name: msg.name,
            })),
            stream,
        };
        if (request.maxTokens !== undefined) {
            openaiRequest.max_tokens = request.maxTokens;
        }
        if (request.temperature !== undefined) {
            openaiRequest.temperature = request.temperature;
        }
        if (request.topP !== undefined) {
            openaiRequest.top_p = request.topP;
        }
        if (request.tools) {
            openaiRequest.tools = request.tools;
        }
        if (request.toolChoice) {
            if (typeof request.toolChoice === 'string') {
                openaiRequest.tool_choice = request.toolChoice;
            }
            else {
                openaiRequest.tool_choice = {
                    type: 'function',
                    function: { name: request.toolChoice.name },
                };
            }
        }
        return openaiRequest;
    }
    transformResponse(response, originalRequest) {
        const model = this.models.find(m => m.name === response.model || m.id === response.model);
        const usage = this.calculateUsage(response.usage, model);
        return {
            id: response.id,
            model: response.model,
            provider: this.provider,
            choices: response.choices.map(choice => {
                var _a;
                return ({
                    index: choice.index,
                    message: {
                        role: 'assistant',
                        content: choice.message.content || '',
                        metadata: originalRequest.metadata,
                    },
                    finishReason: choice.finish_reason,
                    toolCalls: (_a = choice.message.tool_calls) === null || _a === void 0 ? void 0 : _a.map(tc => ({
                        id: tc.id,
                        type: tc.type,
                        function: tc.function,
                    })),
                });
            }),
            usage,
            created: response.created,
            metadata: originalRequest.metadata,
        };
    }
    transformStreamChunk(chunk, originalRequest) {
        if (!chunk.choices || chunk.choices.length === 0)
            return null;
        return {
            id: chunk.id,
            model: chunk.model,
            provider: this.provider,
            choices: chunk.choices.map(choice => {
                var _a;
                return ({
                    index: choice.index,
                    delta: {
                        role: choice.delta.role,
                        content: choice.delta.content,
                        toolCalls: (_a = choice.delta.tool_calls) === null || _a === void 0 ? void 0 : _a.map(tc => {
                            var _a, _b;
                            return ({
                                id: tc.id || '',
                                type: 'function',
                                function: {
                                    name: ((_a = tc.function) === null || _a === void 0 ? void 0 : _a.name) || '',
                                    arguments: ((_b = tc.function) === null || _b === void 0 ? void 0 : _b.arguments) || '',
                                },
                            });
                        }),
                    },
                    finishReason: choice.finish_reason,
                });
            }),
            usage: chunk.usage ? this.calculateUsage(chunk.usage, this.models.find(m => m.name === chunk.model)) : undefined,
            created: chunk.created,
        };
    }
    calculateUsage(usage, model) {
        const inputCost = model ? (usage.prompt_tokens / 1000) * model.inputCostPer1K : 0;
        const outputCost = model ? (usage.completion_tokens / 1000) * model.outputCostPer1K : 0;
        return {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            cost: inputCost + outputCost,
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.js.map