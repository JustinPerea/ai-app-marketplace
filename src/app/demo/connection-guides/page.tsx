'use client';

import { useState } from 'react';
import { ProviderSelection } from '@/components/features/connection-guides/provider-selection';
import { VisualConnectionGuide } from '@/components/features/connection-guides/visual-connection-guide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleStars } from '@/components/ui/simple-stars';
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

export default function ConnectionGuidesDemo() {
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
      <>
        <SimpleStars starCount={50} parallaxSpeed={0.3} />
        <div className="relative py-8">
          {/* Cosmic background */}
          <div className="absolute inset-0 pointer-events-none" 
               style={{ 
                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
               }}>
          </div>
          
          <div className="max-w-4xl mx-auto p-6 relative z-10">
            {/* Demo Header */}
            <div className="mb-8 text-center">
              <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-4" 
                   style={{ 
                     background: 'rgba(139, 92, 246, 0.1)', 
                     borderColor: 'rgba(139, 92, 246, 0.3)' 
                   }}>
                <span className="text-sm font-medium text-text-primary">Beta</span>
              </div>
              <h1 className="text-section-header text-text-primary">AI App Marketplace - Visual Connection Guides</h1>
            </div>

            {/* Success Celebration */}
            <div className="text-center space-y-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B35)' }}>
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-hero-glass text-text-primary">🎉 Connection Successful!</h1>
                <p className="text-body-lg text-text-secondary">
                  {selectedProviderId === 'openai' && 'OpenAI is now connected and ready to use'}
                  {selectedProviderId === 'anthropic' && 'Anthropic Claude is now connected and ready to use'}
                  {selectedProviderId === 'google' && 'Google AI is now connected and ready to use'}
                </p>
              </div>

              {/* Achievement Badges */}
              <div className="flex justify-center space-x-4">
                <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center" 
                     style={{ 
                       background: 'rgba(139, 92, 246, 0.1)', 
                       borderColor: 'rgba(139, 92, 246, 0.3)' 
                     }}>
                  <Trophy className="h-4 w-4 mr-2" style={{ color: '#8B5CF6' }} />
                  <span className="text-text-primary font-medium">Provider Connected</span>
                </div>
                <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center" 
                     style={{ 
                       background: 'rgba(255, 215, 0, 0.1)', 
                       borderColor: 'rgba(255, 215, 0, 0.3)' 
                     }}>
                  <Target className="h-4 w-4 mr-2" style={{ color: '#FFD700' }} />
                  <span className="text-text-primary font-medium">Saving Money</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="glass-card p-6 mb-6">
              <div className="mb-6">
                <h3 className="text-h3 text-text-primary mb-2">🚀 What's Next?</h3>
                <p className="text-body-glass">
                  Now that you're connected, here's how to maximize your savings
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-text-primary">Immediate Actions:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#FFD700' }} />
                        <span className="text-text-secondary">Send a test message to verify connection</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#FFD700' }} />
                        <span className="text-text-secondary">Check your usage dashboard</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#FFD700' }} />
                        <span className="text-text-secondary">Enable cost optimization routing</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-text-primary">Connect More Providers:</h4>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Connect 2+ providers for maximum savings</li>
                      <li>• Enable automatic provider switching</li>
                      <li>• Set up usage alerts and budgets</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Providers Summary */}
            <div className="glass-card p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-h3 text-text-primary">Your Connected Providers ({connectedProviders.length}/3)</h3>
              </div>
              <div>
                <div className="space-y-3">
                  {connectedProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 rounded-lg border"
                         style={{ 
                           background: 'rgba(255, 215, 0, 0.1)', 
                           borderColor: 'rgba(255, 215, 0, 0.3)' 
                         }}>
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#FFD700' }} />
                        <div>
                          <div className="font-medium text-text-primary">{provider.name}</div>
                          <div className="text-sm text-text-secondary">{provider.keyName}</div>
                        </div>
                      </div>
                      <div className="text-sm text-text-muted">
                        Connected {provider.connectedAt}
                      </div>
                    </div>
                  ))}
                </div>
                
                {connectedProviders.length < 3 && (
                  <div className="mt-4 p-3 rounded-lg border"
                       style={{ 
                         background: 'rgba(59, 130, 246, 0.1)', 
                         borderColor: 'rgba(59, 130, 246, 0.3)' 
                       }}>
                    <div className="text-sm text-text-primary">
                      💡 <strong>Pro Tip:</strong> Connect multiple providers for cost optimization and flexibility
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <button onClick={handleStartOver} className="px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105" 
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}>
                Connect Another Provider
              </button>
              <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105" 
                      style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                      }}>
                Start Demo Over
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentView === 'connecting') {
    return (
      <>
        <SimpleStars starCount={50} parallaxSpeed={0.3} />
        <div className="relative py-8">
          {/* Cosmic background */}
          <div className="absolute inset-0 pointer-events-none" 
               style={{ 
                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
               }}>
          </div>
          
          <div className="max-w-6xl mx-auto p-6 relative z-10">
            {/* Demo Header */}
            <div className="mb-8 text-center">
              <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-4" 
                   style={{ 
                     background: 'rgba(139, 92, 246, 0.1)', 
                     borderColor: 'rgba(139, 92, 246, 0.3)' 
                   }}>
                <span className="text-sm font-medium text-text-primary">Beta</span>
              </div>
              <h1 className="text-section-header text-text-primary">AI App Marketplace - Visual Connection Guides</h1>
            </div>

            <div className="mb-6">
              <button onClick={handleBackToSelection} className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3B82F6'
                      }}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Provider Selection</span>
              </button>
            </div>
            
            <VisualConnectionGuide 
              providerId={selectedProviderId}
              onComplete={handleConnectionComplete}
              onCancel={handleBackToSelection}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      <div className="relative py-8">
        {/* Cosmic background */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
             }}>
        </div>
        
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          {/* Demo Header */}
          <div className="mb-8 text-center">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-4" 
                 style={{ 
                   background: 'rgba(139, 92, 246, 0.1)', 
                   borderColor: 'rgba(139, 92, 246, 0.3)' 
                 }}>
              <span className="text-sm font-medium text-text-primary">DEMO MODE</span>
            </div>
            <h1 className="text-section-header text-text-primary">AI App Marketplace - Visual Connection Guides</h1>
            <p className="text-body-lg text-text-secondary mt-2">
              Connect your AI providers with guided setup assistance
            </p>
          </div>

          <ProviderSelection 
            onProviderSelect={handleProviderSelect}
            onShowComparison={() => {
              console.log('Show comparison modal');
            }}
          />
        </div>
      </div>
    </>
  );
}