'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Key, 
  MoreHorizontal, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Shield,
  Activity
} from 'lucide-react';

const apiKeys = [
  {
    id: 1,
    provider: 'OpenAI',
    name: 'GPT-4 Production',
    keyPreview: 'sk-...xyz123',
    usage: 67,
    limit: 1000,
    costThisMonth: 89.32,
    requestsThisMonth: 15420,
    status: 'healthy',
    lastUsed: '2 hours ago',
    created: '2024-01-15',
    encrypted: true
  },
  {
    id: 2,
    provider: 'Anthropic',
    name: 'Claude Production',
    keyPreview: 'sk-ant-...abc789',
    usage: 85,
    limit: 800,
    costThisMonth: 124.56,
    requestsThisMonth: 8930,
    status: 'warning',
    lastUsed: '1 day ago',
    created: '2024-01-20',
    encrypted: true
  },
  {
    id: 3,
    provider: 'Google AI',
    name: 'Gemini Development',
    keyPreview: 'AIza...def456',
    usage: 23,
    limit: 500,
    costThisMonth: 12.78,
    requestsThisMonth: 2340,
    status: 'healthy',
    lastUsed: '3 days ago',
    created: '2024-02-01',
    encrypted: true
  },
  {
    id: 4,
    provider: 'Cohere',
    name: 'Cohere Testing',
    keyPreview: 'co-...ghi789',
    usage: 5,
    limit: 200,
    costThisMonth: 2.34,
    requestsThisMonth: 156,
    status: 'inactive',
    lastUsed: '1 week ago',
    created: '2024-02-10',
    encrypted: true
  }
];

const providers = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5, DALL-E, Whisper' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3, Claude 2' },
  { id: 'google', name: 'Google AI', description: 'Gemini Pro, Gemini Vision' },
  { id: 'cohere', name: 'Cohere', description: 'Command, Embed, Rerank' },
  { id: 'huggingface', name: 'Hugging Face', description: 'Open source models' }
];

export default function APIKeysPage() {
  const [showKey, setShowKey] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
        <p className="text-gray-600 mt-2">
          Securely manage your AI provider API keys with enterprise-grade encryption
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(apiKeys.map(k => k.provider)).size} providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${apiKeys.reduce((sum, key) => sum + key.costThisMonth, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((sum, key) => sum + key.requestsThisMonth, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">All Secure</span>
            </div>
            <p className="text-xs text-muted-foreground">Envelope encrypted</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Key Button */}
      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Select a provider and add your API key. Keys are encrypted using envelope encryption.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Provider</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {selectedProvider && (
                  <p className="text-xs text-gray-500 mt-1">
                    {providers.find(p => p.id === selectedProvider)?.description}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input placeholder="e.g., Production GPT-4" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">API Key</label>
                <Input type="password" placeholder="Paste your API key here" className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">
                  Your key will be encrypted and stored securely
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Key</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      <div className="grid gap-6">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <Badge variant={getStatusColor(apiKey.status)}>
                      {apiKey.status}
                    </Badge>
                    {apiKey.encrypted && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {apiKey.provider} • Created {apiKey.created} • Last used {apiKey.lastUsed}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Key Preview */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono">
                      {showKey === apiKey.id ? 'sk-abcd1234567890...' : apiKey.keyPreview}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                    >
                      {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Rotate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage this month</span>
                    <span className="font-medium">
                      {apiKey.usage}% ({apiKey.requestsThisMonth.toLocaleString()} / {apiKey.limit} requests)
                    </span>
                  </div>
                  <Progress value={apiKey.usage} className="h-2" />
                  {apiKey.usage >= 85 && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Approaching usage limit
                    </div>
                  )}
                </div>

                {/* Cost and Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cost this month</p>
                    <p className="font-semibold text-lg">${apiKey.costThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Requests this month</p>
                    <p className="font-semibold text-lg">{apiKey.requestsThisMonth.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Shield className="h-5 w-5 mr-2" />
            Security & Encryption
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p className="text-sm">
            • All API keys are encrypted using Google Cloud KMS envelope encryption
          </p>
          <p className="text-sm">
            • Keys are never stored in plaintext and are only decrypted when needed
          </p>
          <p className="text-sm">
            • We recommend rotating keys monthly for maximum security
          </p>
          <p className="text-sm">
            • Usage monitoring helps detect unusual activity patterns
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}