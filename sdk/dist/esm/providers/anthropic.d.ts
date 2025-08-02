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
import { AIRequest, AIResponse, AIStreamChunk, AIModel, APIProvider } from '../types';
export declare class AnthropicProvider extends BaseAIProvider {
    readonly provider = APIProvider.ANTHROPIC;
    protected readonly baseUrl = "https://api.anthropic.com/v1";
    protected readonly defaultHeaders: {
        'Content-Type': string;
        'anthropic-version': string;
        'User-Agent': string;
    };
    private models;
    protected getAuthHeaders(apiKey: string): Record<string, string>;
    getModels(): Promise<AIModel[]>;
    validateApiKey(apiKey: string): Promise<boolean>;
    chat(request: AIRequest, apiKey: string): Promise<AIResponse>;
    chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk>;
    private transformRequest;
    private transformResponse;
    private transformStreamChunk;
    private calculateUsage;
    private mapStopReason;
}
//# sourceMappingURL=anthropic.d.ts.map