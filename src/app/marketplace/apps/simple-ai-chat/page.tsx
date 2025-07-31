'use client';

import { useState, useEffect } from 'react';
// Simple layout without auth for the chatbot app
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Using native select element since Select component doesn't exist
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Zap,
  MessageCircle,
  Cpu,
  Globe
} from 'lucide-react';
import { ProviderLogo, getProviderDisplayName } from '@/components/ui/provider-logo';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  provider?: string;
  model?: string;
}

interface ProviderConfig {
  name: string;
  id: string;
  models: string[];
  icon: string;
  status: 'connected' | 'disconnected' | 'checking';
  description: string;
}

export default function SimpleAIChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);

  // Initialize providers with API key status checking
  useEffect(() => {
    const initializeProviders = async () => {
      const providerConfigs: ProviderConfig[] = [
        {
          name: 'OpenAI',
          id: 'OPENAI',
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
          icon: 'OPENAI',
          status: 'checking',
          description: 'GPT models for general conversation'
        },
        {
          name: 'Anthropic Claude',
          id: 'ANTHROPIC',
          models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
          icon: 'ANTHROPIC',
          status: 'checking',
          description: 'Claude models for thoughtful dialogue'
        },
        {
          name: 'Google AI',
          id: 'GOOGLE',
          models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
          icon: 'GOOGLE',
          status: 'checking',
          description: 'Gemini models for creative tasks'
        },
        {
          name: 'Cohere',
          id: 'COHERE',
          models: ['command-r-plus', 'command-r'],
          icon: 'COHERE',
          status: 'checking',
          description: 'Command models for enterprise use'
        },
        {
          name: 'Hugging Face',
          id: 'HUGGING_FACE',
          models: ['meta-llama/Llama-2-70b-chat-hf'],
          icon: 'HUGGING_FACE',
          status: 'checking',
          description: 'Open source models'
        },
        {
          name: 'Local (Ollama)',
          id: 'LOCAL',
          models: ['llama3.2:3b', 'llama3.2:1b'],
          icon: 'LOCAL',
          status: 'checking',
          description: 'Local models via Ollama'
        }
      ];

      // Check API key status for each provider using APIKeyManager
      const { APIKeyManager } = await import('@/lib/api-keys-hybrid');
      
      for (const provider of providerConfigs) {
        try {
          // Check if we have an API key for this provider
          const apiKey = await APIKeyManager.getKey(provider.id);
          if (apiKey) {
            // Test the API key
            const testResult = await APIKeyManager.test(provider.id, apiKey);
            provider.status = testResult.success ? 'connected' : 'disconnected';
          } else {
            provider.status = 'disconnected';
          }
        } catch (error) {
          provider.status = 'disconnected';
        }
      }

      setProviders(providerConfigs);
      
      // Auto-select first available provider
      const firstConnected = providerConfigs.find(p => p.status === 'connected');
      if (firstConnected) {
        setSelectedProvider(firstConnected.id);
        setSelectedModel(firstConnected.models[0]);
      }
    };

    initializeProviders();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProvider || !selectedModel || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get API keys using the APIKeyManager
      const { APIKeyManager } = await import('@/lib/api-keys-hybrid');
      
      // Prepare headers with API keys
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Get the actual API key for the selected provider
      const apiKey = await APIKeyManager.getKey(selectedProvider);
      
      if (apiKey) {
        if (selectedProvider === 'OPENAI') {
          headers['x-openai-key'] = apiKey;
        } else if (selectedProvider === 'ANTHROPIC') {
          headers['x-anthropic-key'] = apiKey;
        } else if (selectedProvider === 'GOOGLE') {
          headers['x-google-key'] = apiKey;
        } else if (selectedProvider === 'COHERE') {
          headers['x-cohere-key'] = apiKey;
        } else if (selectedProvider === 'HUGGING_FACE') {
          headers['x-huggingface-key'] = apiKey;
        }
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: inputMessage }],
          provider: selectedProvider,
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response || 'No response received',
        role: 'assistant',
        timestamp: new Date(),
        provider: selectedProvider,
        model: selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        role: 'assistant',
        timestamp: new Date(),
        provider: selectedProvider,
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (providerId: string) => {
    return <ProviderLogo provider={providerId} size={16} className="inline-flex" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Simple header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Simple AI Chat</h1>
            </div>
            <a href="/marketplace" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Marketplace
            </a>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Simple AI Chat</h1>
                <p className="text-gray-600">Direct conversation with your choice of AI model</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>AI Model Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your AI provider and model
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      AI Provider
                    </label>
                    <select 
                      value={selectedProvider} 
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select provider...</option>
                      {providers.map((provider) => (
                        <option 
                          key={provider.id} 
                          value={provider.id}
                          disabled={provider.status !== 'connected'}
                        >
                          {provider.name} ({provider.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selection */}
                  {selectedProvider && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Model
                      </label>
                      <select 
                        value={selectedModel} 
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select model...</option>
                        {providers
                          .find(p => p.id === selectedProvider)
                          ?.models.map((model) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Provider Status */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Provider Status</h4>
                    {providers.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <ProviderLogo provider={provider.id} size={16} />
                          <span>{provider.name}</span>
                        </div>
                        {getStatusIcon(provider.status)}
                      </div>
                    ))}
                  </div>

                  {/* API Key Alert */}
                  {providers.filter(p => p.status === 'connected').length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No API keys configured. Visit{' '}
                        <a href="/setup" className="text-blue-600 hover:underline">
                          Setup
                        </a>{' '}
                        to add your API keys.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="glass-card h-[600px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>Conversation</span>
                    </CardTitle>
                    {selectedProvider && selectedModel && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <ProviderLogo provider={selectedProvider} size={14} />
                        <span>{selectedModel}</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-auto pr-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Start a conversation with your AI assistant</p>
                          <p className="text-sm">Choose a provider and model, then type a message</p>
                        </div>
                      )}

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex space-x-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border shadow-sm'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.provider && (
                              <div className="flex items-center space-x-1 mt-1 text-xs opacity-70">
                                <ProviderLogo provider={message.provider} size={12} />
                                <span>{message.model}</span>
                              </div>
                            )}
                          </div>

                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex space-x-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-white border shadow-sm px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="mt-4 flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={!selectedProvider || !selectedModel || isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || !selectedProvider || !selectedModel || isLoading}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}