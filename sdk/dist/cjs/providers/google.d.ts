/**
 * Google AI Provider Implementation
 *
 * Implements Google Gemini API integration with support for:
 * - Gemini Pro and Flash models
 * - Streaming responses
 * - Function calling
 * - Cost optimization
 */
import { BaseAIProvider } from './base';
import { AIRequest, AIResponse, AIStreamChunk, AIModel, APIProvider } from '../types';
export declare class GoogleProvider extends BaseAIProvider {
    readonly provider = APIProvider.GOOGLE;
    protected readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";
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
    private mapFinishReason;
}
//# sourceMappingURL=google.d.ts.map