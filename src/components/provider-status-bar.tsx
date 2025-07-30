'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap, 
  Shield,
  DollarSign,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProviderStatus {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  type: 'cloud' | 'local';
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  costPerToken?: string;
  privacy: string;
}

export function ProviderStatusBar() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      // Check Ollama status first
      const ollamaConnected = await checkOllamaStatus();
      
      // For now, simulate provider status - would connect to real API
      const mockProviders: ProviderStatus[] = [
        {
          id: 'google-gemini',
          name: 'Gemini Flash',
          icon: '🟡',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.075/1M',
          privacy: 'High'
        },
        {
          id: 'anthropic-claude',
          name: 'Claude Haiku',
          icon: '🔮',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.25/1M',
          privacy: 'High'
        },
        {
          id: 'openai-gpt4',
          name: 'GPT-4o Mini',
          icon: '🤖',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.15/1M',
          privacy: 'Medium'
        },
        {
          id: 'ollama-local',
          name: 'Local AI (Ollama)',
          icon: '🏠',
          connected: ollamaConnected,
          type: 'local',
          status: ollamaConnected ? 'healthy' : 'disconnected',
          costPerToken: 'Free',
          privacy: 'Highest'
        }
      ];

      setProviders(mockProviders);
    } catch (error) {
      console.error('Failed to fetch provider status:', error);
      // Fallback to default state
      setProviders([
        {
          id: 'google-gemini',
          name: 'Gemini Flash',
          icon: '🟡',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.075/1M',
          privacy: 'High'
        },
        {
          id: 'anthropic-claude',
          name: 'Claude Haiku',
          icon: '🔮',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.25/1M',
          privacy: 'High'
        },
        {
          id: 'openai-gpt4',
          name: 'GPT-4o Mini',
          icon: '🤖',
          connected: false,
          type: 'cloud',
          status: 'disconnected',
          costPerToken: '$0.15/1M',
          privacy: 'Medium'
        },
        {
          id: 'ollama-local',
          name: 'Local AI (Ollama)',
          icon: '🏠',
          connected: false,
          type: 'local',
          status: 'disconnected',
          costPerToken: 'Free',
          privacy: 'Highest'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOllamaStatus = async (): Promise<boolean> => {
    try {
      // Only check if we're in the browser
      if (typeof window === 'undefined') return false;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://localhost:11434/api/tags', { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const connectedCount = providers.filter(p => p.connected).length;
  const totalCount = providers.length;

  if (isLoading) {
    return (
      <div className="border-b bg-blue-50/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-3">
        {/* Collapsed View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                AI Providers: {connectedCount}/{totalCount} Connected
              </span>
            </div>
            
            {/* Quick Status Icons */}
            <div className="flex items-center gap-1">
              {providers.slice(0, 4).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-1 text-xs"
                  title={`${provider.name}: ${provider.connected ? 'Connected' : 'Disconnected'}`}
                >
                  <span>{provider.icon}</span>
                  {getStatusIcon(provider.status)}
                </div>
              ))}
            </div>

            {connectedCount === 0 && (
              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                No providers connected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Details
                </>
              )}
            </Button>
            
            <Button size="sm" asChild>
              <Link href="/dashboard/ai-providers">
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Link>
            </Button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {providers.map((provider) => (
              <Card key={provider.id} className="bg-white/80">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{provider.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium">{provider.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(provider.status)}`}
                        >
                          {provider.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Cost:</span>
                      <span className="font-mono">{provider.costPerToken}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Privacy:</span>
                      <span>{provider.privacy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{provider.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {connectedCount === 0 && isExpanded && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Connect Your First AI Provider
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Bring your own API keys for maximum cost control, privacy, and flexibility. 
                  Save up to 70% with intelligent caching.
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/ai-providers">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Provider
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/ai-guide">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}