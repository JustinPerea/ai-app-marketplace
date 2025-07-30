'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  Plus, 
  CheckCircle,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Trash2,
  Shield,
  Zap,
  DollarSign,
  Wifi,
  WifiOff
} from 'lucide-react';
import { APIKeyManager, PROVIDER_CONFIGS, type StoredAPIKey } from '@/lib/api-keys-hybrid';
import { useUsageTracking } from '@/lib/hooks/useUsageAnalytics';

// Remove duplicate interface definition since it's imported from hybrid manager

export default function SetupPage() {
  const [apiKeys, setApiKeys] = useState<StoredAPIKey[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: { success: boolean; error?: string; testing: boolean }}>({});
  const [formTestResult, setFormTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  
  // Usage tracking hook
  const { trackEvent } = useUsageTracking();
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    apiKey: '',
    showKey: false
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await APIKeyManager.getAll();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      // Gracefully handle errors - the hybrid manager will fallback to localStorage
      setApiKeys([]);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !form.apiKey.trim() || !form.name.trim()) return;

    setTestingProvider(selectedProvider);
    setFormTestResult(null);

    try {
      // Test the API key first
      const testResult = await APIKeyManager.test(selectedProvider, form.apiKey.trim());
      
      if (testResult.success) {
        // Add the key if test passed
        try {
          await APIKeyManager.add(selectedProvider, form.name.trim(), form.apiKey.trim());
          await loadApiKeys();
          
          setFormTestResult({ success: true });
          
          // Reset form after a brief success display
          setTimeout(() => {
            setForm({ name: '', apiKey: '', showKey: false });
            setSelectedProvider('');
            setShowAddForm(false);
            setFormTestResult(null);
          }, 2000);
        } catch (error) {
          setFormTestResult({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to add API key' 
          });
        }
      } else {
        setFormTestResult({ success: false, error: testResult.error });
      }
    } catch (error) {
      setFormTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleTestConnection = async (keyId: string, provider: string) => {
    setTestResults(prev => ({ ...prev, [keyId]: { success: false, testing: true } }));

    try {
      const testResult = await APIKeyManager.test(provider);
      
      // Track usage event if the API response includes tracking data
      if (testResult.usageEventData) {
        trackEvent(testResult.usageEventData);
        console.log('Usage event tracked for provider:', provider);
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        [keyId]: { 
          success: testResult.success, 
          error: testResult.error,
          testing: false 
        } 
      }));

      // Clear result after 5 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[keyId];
          return newResults;
        });
      }, 5000);
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [keyId]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Test failed',
          testing: false 
        } 
      }));

      // Clear result after 5 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[keyId];
          return newResults;
        });
      }, 5000);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      try {
        await APIKeyManager.delete(id);
        await loadApiKeys();
      } catch (error) {
        console.error('Failed to delete API key:', error);
        // Still reload keys to reflect current state
        await loadApiKeys();
      }
    }
  };

  const connectedProviders = apiKeys.filter(k => k.isActive);
  const availableProviders = Object.keys(PROVIDER_CONFIGS).filter(
    provider => !apiKeys.some(k => k.provider === provider && k.isActive)
  );

  return (
    <MainLayout>
      {/* Simple stars background with parallax scrolling */}
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Cosmara stellar background with cosmic gradients */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
           }}>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header - Cosmic styling */}
        <div className="mb-8 text-center">
          <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
               style={{ 
                 background: 'rgba(255, 215, 0, 0.1)', 
                 borderColor: 'rgba(255, 215, 0, 0.3)' 
               }}>
            <Key className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
            <span className="text-sm font-medium text-text-primary">AI Provider Setup</span>
          </div>
          <h1 className="text-hero-glass mb-4">
            <span className="text-glass-gradient">Connect Your Universe</span>
          </h1>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Connect your API keys to unlock AI-powered applications. Your keys are stored securely and never shared.
          </p>
        </div>

        {/* Quick Stats - Cosmic glass design */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 cursor-pointer group">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <Key className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stardust-muted">Connected Providers</p>
                <p className="text-2xl font-bold text-text-primary">{connectedProviders.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 cursor-pointer group">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B35)' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stardust-muted">Privacy</p>
                <p className="text-2xl font-bold text-text-primary">100%</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 cursor-pointer group">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stardust-muted">Cost Savings</p>
                <p className="text-2xl font-bold text-text-primary">70%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Providers */}
        {connectedProviders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Connected Providers
              </CardTitle>
              <CardDescription>
                Your active AI providers are ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedProviders.map((key) => {
                  const config = PROVIDER_CONFIGS[key.provider as keyof typeof PROVIDER_CONFIGS];
                  const testResult = testResults[key.id];
                  
                  return (
                    <div key={key.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <h4 className="font-medium">{key.name}</h4>
                            <p className="text-sm text-gray-600">{config.name} • {key.keyPreview}</p>
                            {key.lastUsed && (
                              <p className="text-xs text-gray-500">
                                Last used: {new Date(key.lastUsed).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                            Active
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(key.id, key.provider)}
                            disabled={testResult?.testing}
                          >
                            {testResult?.testing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Wifi className="h-4 w-4 mr-2" />
                                Test Connection
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Test Results */}
                      {testResult && !testResult.testing && (
                        <div className="mt-3">
                          {testResult.success ? (
                            <Alert className="border-green-200 bg-green-50">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-800">
                                ✅ Connection successful! Your {config.name} API key is working correctly.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Alert className="border-red-200 bg-red-50">
                              <WifiOff className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-800">
                                ❌ Connection failed: {testResult.error}
                                {testResult.error?.includes('payment') && (
                                  <div className="mt-2 text-sm">
                                    💡 <strong>Need a free alternative?</strong> Try Google Gemini (free 15 requests per minute) or Anthropic Claude ($5 free credit).
                                  </div>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Provider Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add AI Provider
            </CardTitle>
            <CardDescription>
              Connect a new AI provider to expand your capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <div className="space-y-4">
                <p className="text-gray-600">Choose a provider to get started:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {availableProviders.map((provider) => {
                    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
                    return (
                      <div
                        key={provider}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setForm(prev => ({ ...prev, name: `My ${config.name} Key` }));
                          setShowAddForm(true);
                        }}
                      >
                        <div className="text-center">
                          <span className="text-3xl mb-2 block">{config.icon}</span>
                          <h4 className="font-medium">{config.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {config.models.length} models available
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {availableProviders.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Set!</h3>
                    <p className="text-gray-600">
                      You've connected all available AI providers. You're ready to start using AI applications!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAddProvider} className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {PROVIDER_CONFIGS[selectedProvider as keyof typeof PROVIDER_CONFIGS]?.icon}
                  </span>
                  <div>
                    <h3 className="font-medium">
                      Connect {PROVIDER_CONFIGS[selectedProvider as keyof typeof PROVIDER_CONFIGS]?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get your API key from their platform
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input
                    id="provider-name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My OpenAI Key"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={form.showKey ? 'text' : 'password'}
                      value={form.apiKey}
                      onChange={(e) => setForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={PROVIDER_CONFIGS[selectedProvider as keyof typeof PROVIDER_CONFIGS]?.keyFormat}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setForm(prev => ({ ...prev, showKey: !prev.showKey }))}
                    >
                      {form.showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Your API key will be tested and stored securely
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <strong>Don't have an API key?</strong>{' '}
                    <a 
                      href={PROVIDER_CONFIGS[selectedProvider as keyof typeof PROVIDER_CONFIGS]?.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline inline-flex items-center gap-1"
                    >
                      Get one here <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    type="submit" 
                    disabled={testingProvider === selectedProvider || !form.apiKey.trim() || !form.name.trim()}
                  >
                    {testingProvider === selectedProvider ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect & Test
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedProvider('');
                      setForm({ name: '', apiKey: '', showKey: false });
                      setFormTestResult(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Form Test Results */}
                {formTestResult && (
                  <div className="mt-4">
                    {formTestResult.success ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ✅ Connection successful! {PROVIDER_CONFIGS[selectedProvider as keyof typeof PROVIDER_CONFIGS]?.name} has been added to your account.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          ❌ Connection failed: {formTestResult.error}
                          {formTestResult.error?.includes('payment') && (
                            <div className="mt-2 text-sm">
                              💡 <strong>Need a free alternative?</strong> Try Google Gemini (free 15 requests per minute) or Anthropic Claude ($5 free credit).
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Privacy First</h3>
                <p className="text-sm text-gray-600">
                  Your API keys never leave your browser. Direct communication with AI providers.
                </p>
              </div>
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Cost Control</h3>
                <p className="text-sm text-gray-600">
                  Pay direct API rates with no markup. 70% savings through intelligent caching.
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Flexibility</h3>
                <p className="text-sm text-gray-600">
                  Switch providers anytime. Use multiple AI models for different tasks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}