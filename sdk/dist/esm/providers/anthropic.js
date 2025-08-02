/**
 * Anthropic Provider Implementation
 *
 * Implements Anthropic Claude API integration with support for:
 * - Claude 3 model family
 * - Streaming responses
 * - Tool use
 * - Cost optimization
 */
import { BaseAIProvider } from './base';
import { APIProvider, AIError, } from '../types';
export class AnthropicProvider extends BaseAIProvider {
    constructor() {
        super(...arguments);
        this.provider = APIProvider.ANTHROPIC;
        this.baseUrl = 'https://api.anthropic.com/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'User-Agent': 'AI-Marketplace-SDK/1.0',
        };
        this.models = [
            {
                id: 'claude-3-haiku-20240307',
                provider: APIProvider.ANTHROPIC,
                name: 'claude-3-haiku-20240307',
                displayName: 'Claude 3 Haiku',
                description: 'Fast and cost-effective model for light tasks',
                maxTokens: 4096,
                inputCostPer1K: 0.00025,
                outputCostPer1K: 0.00125,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 200000,
                isActive: true,
            },
            {
                id: 'claude-sonnet-4-20250514',
                provider: APIProvider.ANTHROPIC,
                name: 'claude-sonnet-4-20250514',
                displayName: 'Claude 4 Sonnet',
                description: 'Balanced model for a wide range of tasks - 2025 updated version',
                maxTokens: 4096,
                inputCostPer1K: 0.003,
                outputCostPer1K: 0.015,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 200000,
                isActive: true,
            },
            {
                id: 'claude-3-opus-20240229',
                provider: APIProvider.ANTHROPIC,
                name: 'claude-3-opus-20240229',
                displayName: 'Claude 3 Opus',
                description: 'Most capable model for complex tasks',
                maxTokens: 4096,
                inputCostPer1K: 0.015,
                outputCostPer1K: 0.075,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 200000,
                isActive: true,
            },
            {
                id: 'claude-3-5-sonnet-20241022',
                provider: APIProvider.ANTHROPIC,
                name: 'claude-3-5-sonnet-20241022',
                displayName: 'Claude 3.5 Sonnet',
                description: 'Latest and most capable Sonnet model',
                maxTokens: 8192,
                inputCostPer1K: 0.003,
                outputCostPer1K: 0.015,
                supportsStreaming: true,
                supportsTools: true,
                contextWindow: 200000,
                isActive: true,
            },
        ];
    }
    getAuthHeaders(apiKey) {
        return {
            'x-api-key': apiKey,
        };
    }
    async getModels() {
        return this.models.filter(model => model.isActive);
    }
    async validateApiKey(apiKey) {
        try {
            // Anthropic doesn't have a simple endpoint to validate keys, so we make a minimal request
            const testRequest = {
                model: 'claude-3-haiku-20240307',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'Hi' }],
            };
            await this.makeRequest(`${this.baseUrl}/messages`, {
                method: 'POST',
                body: JSON.stringify(testRequest),
            }, apiKey);
            return true;
        }
        catch (error) {
            if (error instanceof AIError && error.type === 'authentication') {
                return false;
            }
            throw error;
        }
    }
    async chat(request, apiKey) {
        const anthropicRequest = this.transformRequest(request);
        const response = await this.makeRequest(`${this.baseUrl}/messages`, {
            method: 'POST',
            body: JSON.stringify(anthropicRequest),
        }, apiKey);
        return this.transformResponse(response, request);
    }
    async *chatStream(request, apiKey) {
        const anthropicRequest = this.transformRequest(request, true);
        const stream = await this.makeStreamRequest(`${this.baseUrl}/messages`, {
            method: 'POST',
            body: JSON.stringify(anthropicRequest),
        }, apiKey);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let messageId = '';
        let model = request.model;
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
                    if (trimmed === '' || !trimmed.startsWith('data: '))
                        continue;
                    try {
                        const data = JSON.parse(trimmed.slice(6));
                        if (data.type === 'message_start' && data.message) {
                            messageId = data.message.id;
                            model = data.message.model;
                        }
                        const chunk = this.transformStreamChunk(data, request, messageId, model);
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
        finally {
            reader.releaseLock();
        }
    }
    transformRequest(request, stream = false) {
        // Extract system message
        const systemMessage = request.messages.find(msg => msg.role === 'system');
        const nonSystemMessages = request.messages.filter(msg => msg.role !== 'system');
        const anthropicRequest = {
            model: request.model,
            max_tokens: request.maxTokens || 4096,
            messages: nonSystemMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
            })),
            stream,
        };
        if (systemMessage) {
            anthropicRequest.system = systemMessage.content;
        }
        if (request.temperature !== undefined) {
            anthropicRequest.temperature = request.temperature;
        }
        if (request.topP !== undefined) {
            anthropicRequest.top_p = request.topP;
        }
        if (request.tools) {
            anthropicRequest.tools = request.tools.map(tool => ({
                name: tool.function.name,
                description: tool.function.description,
                input_schema: tool.function.parameters,
            }));
        }
        return anthropicRequest;
    }
    transformResponse(response, originalRequest) {
        const model = this.models.find(m => m.name === response.model || m.id === response.model);
        const usage = this.calculateUsage(response.usage, model);
        const content = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');
        return {
            id: response.id,
            model: response.model,
            provider: this.provider,
            choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content,
                        metadata: originalRequest.metadata,
                    },
                    finishReason: this.mapStopReason(response.stop_reason),
                }],
            usage,
            created: Date.now(),
            metadata: originalRequest.metadata,
        };
    }
    transformStreamChunk(chunk, originalRequest, messageId, model) {
        var _a;
        if (chunk.type === 'content_block_delta' && ((_a = chunk.delta) === null || _a === void 0 ? void 0 : _a.type) === 'text_delta') {
            return {
                id: messageId,
                model,
                provider: this.provider,
                choices: [{
                        index: 0,
                        delta: {
                            role: 'assistant',
                            content: chunk.delta.text,
                        },
                    }],
                created: Date.now(),
            };
        }
        if (chunk.type === 'message_stop') {
            return {
                id: messageId,
                model,
                provider: this.provider,
                choices: [{
                        index: 0,
                        delta: {},
                        finishReason: 'stop',
                    }],
                created: Date.now(),
            };
        }
        return null;
    }
    calculateUsage(usage, model) {
        const inputCost = model ? (usage.input_tokens / 1000) * model.inputCostPer1K : 0;
        const outputCost = model ? (usage.output_tokens / 1000) * model.outputCostPer1K : 0;
        return {
            promptTokens: usage.input_tokens,
            completionTokens: usage.output_tokens,
            totalTokens: usage.input_tokens + usage.output_tokens,
            cost: inputCost + outputCost,
        };
    }
    mapStopReason(reason) {
        switch (reason) {
            case 'end_turn':
                return 'stop';
            case 'max_tokens':
                return 'length';
            case 'tool_use':
                return 'tool_calls';
            case 'refusal':
                return 'refusal';
            default:
                return null;
        }
    }
}
//# sourceMappingURL=anthropic.js.map