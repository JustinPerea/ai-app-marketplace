/**
 * OpenAI Provider Implementation
 *
 * Implements OpenAI API integration with support for:
 * - GPT-3.5 and GPT-4 models
 * - Streaming responses
 * - Function calling
 * - Cost optimization
 */
import { BaseAIProvider } from './base';
import { AIRequest, AIResponse, AIStreamChunk, AIModel, APIProvider } from '../types';
export declare class OpenAIProvider extends BaseAIProvider {
    readonly provider = APIProvider.OPENAI;
    protected readonly baseUrl = "https://api.openai.com/v1";
    protected readonly defaultHeaders: {
        'Content-Type': string;
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
}
//# sourceMappingURL=openai.d.ts.map