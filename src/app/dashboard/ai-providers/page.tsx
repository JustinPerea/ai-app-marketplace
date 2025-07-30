'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Settings, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Key,
  Shield,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  BarChart3,
  Info
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  isActive: boolean;
  lastUsed: Date | null;
  totalRequests: number;
  totalCost: number;
  usageLimit?: number;
  alertThreshold?: number;
  healthStatus: 'healthy' | 'stale' | 'untested';
  recentUsage: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

interface AvailableProvider {
  name: string;
  models: string[];
  capabilities: string[];
  pricing: string;
  setup: string;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableProviders, setAvailableProviders] = useState<Record<string, AvailableProvider>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Add form state
  const [addForm, setAddForm] = useState({
    name: '',
    provider: '',
    apiKey: '',
    usageLimit: '',
    alertThreshold: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/ai/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
        setAvailableProviders(data.availableProviders);
      } else {
        // Fallback to mock data when API is not available
        setProviders([]);
        setAvailableProviders({
          'OPENAI': {
            name: 'OpenAI',
            models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            capabilities: ['chat', 'completion', 'embeddings'],
            pricing: 'Pay-per-token',
            setup: 'Get API key from OpenAI platform',
          },
          'ANTHROPIC': {
            name: 'Anthropic',
            models: ['claude-3-sonnet', 'claude-3-haiku'],
            capabilities: ['chat', 'completion'],
            pricing: 'Pay-per-token',
            setup: 'Get API key from Anthropic console',
          },
          'GOOGLE': {
            name: 'Google AI',
            models: ['gemini-pro', 'gemini-pro-vision'],
            capabilities: ['chat', 'completion', 'vision'],
            pricing: 'Pay-per-token',
            setup: 'Get API key from Google AI Studio',
          },
          'OLLAMA': {
            name: 'Ollama (Local)',
            models: ['llama3.2:3b', 'llama3.2:1b', 'llama3.3', 'llama4:scout'],
            capabilities: ['chat', 'completion', 'vision', 'local-processing'],
            pricing: 'Free (local compute)',
            setup: 'Install Ollama locally and pull models',
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      // Fallback to mock data
      setProviders([]);
      setAvailableProviders({
        'OPENAI': {
          name: 'OpenAI',
          models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
          capabilities: ['chat', 'completion', 'embeddings'],
          pricing: 'Pay-per-token',
          setup: 'Get API key from OpenAI platform',
        },
        'ANTHROPIC': {
          name: 'Anthropic',
          models: ['claude-3-sonnet', 'claude-3-haiku'],
          capabilities: ['chat', 'completion'],
          pricing: 'Pay-per-token',
          setup: 'Get API key from Anthropic console',
        },
        'GOOGLE': {
          name: 'Google AI',
          models: ['gemini-pro', 'gemini-pro-vision'],
          capabilities: ['chat', 'completion', 'vision'],
          pricing: 'Pay-per-token',
          setup: 'Get API key from Google AI Studio',
        },
        'OLLAMA': {
          name: 'Ollama (Local)',
          models: ['llama3.2:3b', 'llama3.2:1b', 'llama3.3', 'llama4:scout'],
          capabilities: ['chat', 'completion', 'vision', 'local-processing'],
          pricing: 'Free (local compute)',
          setup: 'Install Ollama locally and pull models',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingProvider('new');

    try {
      // Special handling for Ollama (local) provider
      if (addForm.provider === 'OLLAMA') {
        // Test Ollama connection locally
        const testResult = await testOllamaConnection(addForm.apiKey);
        if (testResult.success) {
          // Add to local storage or state for demo purposes
          const newProvider: Provider = {
            id: Date.now().toString(),
            name: addForm.name,
            provider: addForm.provider,
            keyPreview: addForm.apiKey,
            isActive: true,
            lastUsed: new Date(),
            totalRequests: 0,
            totalCost: 0,
            usageLimit: addForm.usageLimit ? parseFloat(addForm.usageLimit) : undefined,
            alertThreshold: addForm.alertThreshold ? parseFloat(addForm.alertThreshold) : undefined,
            healthStatus: 'healthy',
            recentUsage: { requests: 0, tokens: 0, cost: 0 }
          };
          
          setProviders(prev => [...prev, newProvider]);
          setShowAddForm(false);
          setAddForm({ name: '', provider: '', apiKey: '', usageLimit: '', alertThreshold: '' });
          alert('Ollama provider added successfully!');
        } else {
          alert(`Ollama connection failed: ${testResult.error}`);
        }
      } else {
        // Regular API call for other providers
        const response = await fetch('/api/ai/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addForm.name,
            provider: addForm.provider,
            apiKey: addForm.apiKey,
            usageLimit: addForm.usageLimit ? parseFloat(addForm.usageLimit) : undefined,
            alertThreshold: addForm.alertThreshold ? parseFloat(addForm.alertThreshold) : undefined,
            isActive: true,
          }),
        });

        if (response.ok) {
          await fetchProviders();
          setShowAddForm(false);
          setAddForm({ name: '', provider: '', apiKey: '', usageLimit: '', alertThreshold: '' });
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add provider');
        }
      }
    } catch (error) {
      console.error('Failed to add provider:', error);
      alert('Failed to add provider');
    } finally {
      setTestingProvider(null);
    }
  };

  const testOllamaConnection = async (modelName: string) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello! This is a test.',
          stream: false,
          options: { num_predict: 10 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: `Connection failed: ${error}` };
    }
  };

  const toggleProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/ai/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });

      if (response.ok) {
        await fetchProviders();
      }
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const response = await fetch(`/api/ai/providers/${providerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProviders();
      } else {
        const error = await response.json();
        if (error.recentUsage) {
          const forceDelete = confirm(
            `This provider has recent usage. ${error.details}\n\nDo you want to force delete it?`
          );
          if (forceDelete) {
            const forceResponse = await fetch(`/api/ai/providers/${providerId}?force=true`, {
              method: 'DELETE',
            });
            if (forceResponse.ok) {
              await fetchProviders();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  const testProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const response = await fetch(`/api/ai/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection' }),
      });

      if (response.ok) {
        await fetchProviders();
      }
    } catch (error) {
      console.error('Failed to test provider:', error);
    } finally {
      setTestingProvider(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'stale': return 'bg-yellow-100 text-yellow-800';
      case 'untested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'OPENAI': return '🤖';
      case 'ANTHROPIC': return '🔮';
      case 'GOOGLE': return '🟡';
      case 'AZURE_OPENAI': return '🔷';
      case 'COHERE': return '🌊';
      case 'HUGGING_FACE': return '🤗';
      case 'OLLAMA': return '🏠';
      default: return '🔧';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Providers</h1>
              <p className="text-gray-600 mt-2">
                Manage your API keys for different AI providers. Bring your own keys for maximum cost control and privacy.
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Key className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Providers</p>
                  <p className="text-2xl font-bold">{providers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Providers</p>
                  <p className="text-2xl font-bold">{providers.filter(p => p.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${providers.reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">
                    {providers.reduce((sum, p) => sum + p.totalRequests, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Provider Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New AI Provider</CardTitle>
              <CardDescription>
                Add your API key to start using AI models from this provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProvider} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider-name">Provider Name</Label>
                    <Input
                      id="provider-name"
                      value={addForm.name}
                      onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                      placeholder="My OpenAI Key"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-type">Provider Type</Label>
                    <select
                      id="provider-type"
                      value={addForm.provider}
                      onChange={(e) => setAddForm({...addForm, provider: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Provider</option>
                      {Object.entries(availableProviders).map(([key, provider]) => (
                        <option key={key} value={key}>
                          {getProviderIcon(key)} {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={addForm.apiKey}
                    onChange={(e) => setAddForm({...addForm, apiKey: e.target.value})}
                    placeholder="sk-..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your API key is encrypted and stored securely
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usage-limit">Monthly Usage Limit ($)</Label>
                    <Input
                      id="usage-limit"
                      type="number"
                      value={addForm.usageLimit}
                      onChange={(e) => setAddForm({...addForm, usageLimit: e.target.value})}
                      placeholder="100.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alert-threshold">Alert Threshold ($)</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      value={addForm.alertThreshold}
                      onChange={(e) => setAddForm({...addForm, alertThreshold: e.target.value})}
                      placeholder="80.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button type="submit" disabled={testingProvider === 'new'}>
                    {testingProvider === 'new' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Add & Test Provider
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Providers List */}
        <div className="space-y-4">
          {providers.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Providers</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first AI provider to start using AI-powered applications
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card key={provider.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getProviderIcon(provider.provider)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(provider.healthStatus)}
                          >
                            {provider.healthStatus}
                          </Badge>
                          {!provider.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {availableProviders[provider.provider]?.name} • Key: {provider.keyPreview}
                        </p>
                        {provider.lastUsed && (
                          <p className="text-xs text-gray-500">
                            Last used: {new Date(provider.lastUsed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Usage Stats */}
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${provider.recentUsage.cost.toFixed(2)} (7 days)
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.recentUsage.requests} requests
                        </div>
                        <div className="text-xs text-gray-500">
                          ${provider.totalCost.toFixed(2)} total
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                        >
                          {testingProvider === provider.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleProvider(provider.id)}
                        >
                          {provider.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProvider(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Usage Warnings */}
                  {provider.usageLimit && provider.recentUsage.cost > provider.usageLimit * 0.8 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          High usage: ${provider.recentUsage.cost.toFixed(2)} of ${provider.usageLimit} limit
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* BYOK Benefits */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Info className="h-5 w-5 mr-2" />
              Why Bring Your Own Keys?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Cost Control</h4>
                <p className="text-sm">Pay direct API rates with no markup. See exactly where your money goes.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Privacy</h4>
                <p className="text-sm">Your API keys and data stay under your control. We never see your private keys.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Flexibility</h4>
                <p className="text-sm">Switch providers, models, and settings as needed. No vendor lock-in.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}