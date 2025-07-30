'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ProviderSelection } from '@/components/features/connection-guides/provider-selection';
import { VisualConnectionGuide } from '@/components/features/connection-guides/visual-connection-guide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Trophy,
  Sparkles,
  Target
} from 'lucide-react';

type ViewState = 'selection' | 'connecting' | 'success';

interface ConnectedProvider {
  id: string;
  name: string;
  keyName: string;
  connectedAt: string;
}

export default function ConnectProvidersPage() {
  const [currentView, setCurrentView] = useState<ViewState>('selection');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([
    {
      id: 'google',
      name: 'Google AI',
      keyName: 'Google AI Production',
      connectedAt: '2024-07-20'
    }
  ]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    setCurrentView('connecting');
  };

  const handleConnectionComplete = () => {
    // In real app, this would make API call to save the key
    const providerNames: { [key: string]: string } = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google AI'
    };

    const newConnection: ConnectedProvider = {
      id: selectedProviderId,
      name: providerNames[selectedProviderId] || 'Unknown',
      keyName: `${providerNames[selectedProviderId]} Production`,
      connectedAt: new Date().toISOString().split('T')[0]
    };

    setConnectedProviders(prev => [...prev, newConnection]);
    setCurrentView('success');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedProviderId('');
  };

  const handleStartOver = () => {
    setCurrentView('selection');
    setSelectedProviderId('');
  };

  if (currentView === 'success') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Success Celebration */}
          <div className="text-center space-y-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">🎉 Connection Successful!</h1>
              <p className="text-xl text-gray-600">
                {selectedProviderId === 'openai' && 'OpenAI is now connected and ready to use'}
                {selectedProviderId === 'anthropic' && 'Anthropic Claude is now connected and ready to use'}
                {selectedProviderId === 'google' && 'Google AI is now connected and ready to use'}
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="flex justify-center space-x-4">
              <Badge className="bg-purple-500 text-white px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                Provider Connected
              </Badge>
              <Badge className="bg-green-500 text-white px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Saving Money
              </Badge>
            </div>
          </div>

          {/* What's Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🚀 What's Next?</CardTitle>
              <CardDescription>
                Now that you're connected, here's how to maximize your savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Immediate Actions:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Send a test message to verify connection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Check your usage dashboard</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Enable cost optimization routing</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Connect More Providers:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Connect 2+ providers for maximum savings</li>
                    <li>• Enable automatic provider switching</li>
                    <li>• Set up usage alerts and budgets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Providers Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Connected Providers ({connectedProviders.length}/3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.keyName}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Connected {provider.connectedAt}
                    </div>
                  </div>
                ))}
              </div>
              
              {connectedProviders.length < 3 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    💡 <strong>Pro Tip:</strong> Connect all 3 providers to unlock maximum savings (up to 95% cost reduction)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <Button onClick={handleStartOver} variant="outline">
              Connect Another Provider
            </Button>
            <Button onClick={() => window.location.href = '/dashboard/api-keys'}>
              View All API Keys
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (currentView === 'connecting') {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToSelection}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Provider Selection</span>
          </Button>
        </div>
        
        <VisualConnectionGuide 
          providerId={selectedProviderId}
          onComplete={handleConnectionComplete}
          onCancel={handleBackToSelection}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ProviderSelection 
        onProviderSelect={handleProviderSelect}
        onShowComparison={() => {
          // Could implement a comparison modal here
          console.log('Show comparison modal');
        }}
      />
    </DashboardLayout>
  );
}