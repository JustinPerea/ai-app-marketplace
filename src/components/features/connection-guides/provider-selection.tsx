'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap,
  DollarSign,
  Shield,
  Clock,
  TrendingDown,
  Star,
  Users,
  ChevronRight,
  CheckCircle2,
  Info,
  Settings
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  models: string[];
  strengths: string[];
  pricing: {
    inputTokens: string;
    outputTokens: string;
  };
  savings: string;
  setupTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  popularityScore: number;
  isConnected: boolean;
  specialOffers?: string;
}

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🤖',
    color: 'bg-stellar-purple',
    description: 'Most popular AI models with excellent performance',
    models: ['GPT-4', 'GPT-3.5-Turbo', 'DALL-E 3', 'Whisper'],
    strengths: ['Best overall performance', 'Extensive documentation', 'Large community'],
    pricing: {
      inputTokens: '$0.01/1K',
      outputTokens: '$0.03/1K'
    },
    savings: 'Cost savings vary*',
    setupTime: '5 min',
    difficulty: 'Easy',
    popularityScore: 95,
    isConnected: false,
    specialOffers: 'Free $5 credit for new users'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '🧠',
    color: 'bg-solar-flare',
    description: 'Advanced reasoning with Claude models',
    models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
    strengths: ['Superior reasoning', 'Longer context', 'Safety focused'],
    pricing: {
      inputTokens: '$0.008/1K',
      outputTokens: '$0.024/1K'
    },
    savings: 'Cost savings vary*',
    setupTime: '7 min',
    difficulty: 'Medium',
    popularityScore: 88,
    isConnected: false,
    specialOffers: 'New workbench features available'
  },
  {
    id: 'google',
    name: 'Google AI',
    logo: '🔍',
    color: 'bg-cosmic-blue',
    description: 'Cutting-edge Gemini models with multimodal capabilities',
    models: ['Gemini Pro', 'Gemini Vision', 'Gemini Flash'],
    strengths: ['Fastest responses', 'Multimodal', 'Cost effective'],
    pricing: {
      inputTokens: '$0.0005/1K',
      outputTokens: '$0.0015/1K'
    },
    savings: 'Cost savings vary*',
    setupTime: '10 min',
    difficulty: 'Advanced',
    popularityScore: 82,
    isConnected: true
  }
];

interface ProviderSelectionProps {
  onProviderSelect: (providerId: string) => void;
  onShowComparison?: () => void;
}

export function ProviderSelection({ onProviderSelect, onShowComparison }: ProviderSelectionProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const connectedCount = providers.filter(p => p.isConnected).length;
  const totalSavings = 'TBD'; // Cost savings under evaluation

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-hero-glass text-text-primary">Connect AI Providers</h1>
        <p className="text-body-lg text-text-secondary max-w-3xl mx-auto">
          Connect multiple AI providers to save money, avoid vendor lock-in, and access the best models for each task
        </p>
        
        {/* Stats Bar */}
        <div className="glass-card p-4">
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#FFD700' }}>{connectedCount}/3</div>
              <div className="text-text-secondary">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#3B82F6' }}>{totalSavings}</div>
              <div className="text-text-secondary">Average Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>10 min</div>
              <div className="text-text-secondary">Total Setup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center cursor-pointer group">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
               style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B35)' }}>
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-h3 mb-3 text-text-primary">Potential Cost Savings*</h3>
          <p className="text-body-glass">
            Choose cost-effective models for different tasks (details coming soon)
          </p>
        </div>
        
        <div className="glass-card p-6 text-center cursor-pointer group">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
               style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-h3 mb-3 text-text-primary">Your Keys, Your Control</h3>
          <p className="text-body-glass">
            Secure key storage with enterprise-standard encryption
          </p>
        </div>
        
        <div className="glass-card p-6 text-center cursor-pointer group">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
               style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-h3 mb-3 text-text-primary">Choose the Right AI Model</h3>
          <p className="text-body-glass">
            Select the best model for your specific needs
          </p>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-section-header text-text-primary">Choose Your Providers</h2>
          {onShowComparison && (
            <button onClick={onShowComparison} className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderColor: '#3B82F6',
                      color: '#3B82F6'
                    }}>
              <Info className="h-4 w-4" />
              <span>Compare Features</span>
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {providers.map((provider) => (
            <div 
              key={provider.id}
              className={`glass-card cursor-pointer transition-all duration-200 ${
                selectedProvider === provider.id ? 'ring-2 shadow-lg' : ''
              }`}
              style={{
                ...(selectedProvider === provider.id && { 
                  borderColor: '#8B5CF6',
                  boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.3), 0 16px 48px rgba(0, 0, 0, 0.3)'
                }),
                ...(provider.isConnected && {
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderColor: 'rgba(255, 215, 0, 0.3)'
                })
              }}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-4 rounded-full text-white text-3xl"
                         style={{ background: provider.color === 'bg-stellar-purple' ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 
                                              provider.color === 'bg-solar-flare' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' :
                                              'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                      {provider.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-h2 text-text-primary">{provider.name}</h3>
                        {provider.isConnected && (
                          <div className="glass-base px-3 py-1 rounded-full border inline-flex items-center" 
                               style={{ 
                                 background: 'rgba(255, 215, 0, 0.1)', 
                                 borderColor: 'rgba(255, 215, 0, 0.3)' 
                               }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" style={{ color: '#FFD700' }} />
                            <span className="text-text-primary font-medium text-sm">Connected</span>
                          </div>
                        )}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium text-text-primary`} style={{
                          background: provider.difficulty === 'Easy' ? 'rgba(255, 215, 0, 0.1)' :
                                     provider.difficulty === 'Medium' ? 'rgba(255, 165, 0, 0.1)' :
                                     'rgba(255, 107, 53, 0.1)',
                          borderColor: provider.difficulty === 'Easy' ? 'rgba(255, 215, 0, 0.3)' :
                                      provider.difficulty === 'Medium' ? 'rgba(255, 165, 0, 0.3)' :
                                      'rgba(255, 107, 53, 0.3)',
                          border: '1px solid'
                        }}>
                          {provider.difficulty}
                        </div>
                      </div>
                      <p className="text-body-glass">{provider.description}</p>
                      
                      {/* Special Offers */}
                      {provider.specialOffers && (
                        <div className="mt-2 text-sm px-3 py-1 rounded-lg inline-block" 
                             style={{
                               background: 'rgba(255, 165, 0, 0.1)',
                               color: '#FFA500',
                               border: '1px solid rgba(255, 165, 0, 0.3)'
                             }}>
                          🎁 {provider.specialOffers}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                      {provider.savings}
                    </div>
                    <div className="text-sm text-text-muted">
                      Setup: {provider.setupTime}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6 space-y-4">
                {/* Models */}
                <div>
                  <h4 className="font-medium text-sm text-text-primary mb-2">Available Models:</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model) => (
                      <div key={model} className="px-2 py-1 rounded text-xs font-medium"
                           style={{
                             background: 'rgba(59, 130, 246, 0.1)',
                             color: '#3B82F6',
                             border: '1px solid rgba(59, 130, 246, 0.3)'
                           }}>
                        {model}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-medium text-sm text-text-primary mb-2">Key Strengths:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {provider.strengths.map((strength) => (
                      <div key={strength} className="flex items-center space-x-1 text-sm text-text-secondary">
                        <Star className="h-3 w-3" style={{ color: '#FFD700' }} />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                  <h4 className="font-medium text-sm text-text-primary mb-2">Pricing (1K tokens):</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Input: </span>
                      <span className="font-medium text-text-primary">{provider.pricing.inputTokens}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Output: </span>
                      <span className="font-medium text-text-primary">{provider.pricing.outputTokens}</span>
                    </div>
                  </div>
                </div>

                {/* Popularity */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Developer Popularity</span>
                    <span className="font-medium text-text-primary">{provider.popularityScore}%</span>
                  </div>
                  <Progress value={provider.popularityScore} className="h-2" />
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {provider.isConnected ? (
                    <button 
                      className="w-full px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProviderSelect(provider.id);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Manage Connection</span>
                    </button>
                  ) : (
                    <button 
                      className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                      style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProviderSelect(provider.id);
                      }}
                    >
                      <span>Connect {provider.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Savings Simulation */}
      <div className="glass-card p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-6 w-6" style={{ color: '#FFD700' }} />
            <h3 className="text-h3 text-text-primary">Projected Monthly Savings</h3>
          </div>
          <p className="text-body-glass">
            Based on typical usage patterns
          </p>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#FF6B35' }}>$850</div>
              <div className="text-sm text-text-secondary">Single Provider (GPT-4 only)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#FFA500' }}>$420</div>
              <div className="text-sm text-text-secondary">Mixed Usage (Manual)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#FFD700' }}>$180</div>
              <div className="text-sm text-text-secondary">Smart Routing (Optimized)</div>
              <div className="mt-1 glass-base px-3 py-1 rounded-full border inline-flex items-center" 
                   style={{ 
                     background: 'rgba(255, 215, 0, 0.1)', 
                     borderColor: 'rgba(255, 215, 0, 0.3)' 
                   }}>
                <span className="text-text-primary font-medium text-sm">79% Savings</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <h4 className="font-medium mb-2 text-text-primary">Typical Usage Breakdown:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Simple queries (70%)</span>
                <span className="text-text-primary">→ Google AI Gemini Flash ($25/month)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Complex reasoning (20%)</span>
                <span className="text-text-primary">→ Claude 3 Haiku ($85/month)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Advanced tasks (10%)</span>
                <span className="text-text-primary">→ GPT-4 when needed ($70/month)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <h3 className="text-h3 text-text-primary mb-2">Ready to Start Saving?</h3>
          <p className="text-body-glass">
            Connect your first provider now - it only takes a few minutes
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" style={{ color: '#3B82F6' }} />
            <span className="text-text-primary">Each provider takes 5-10 minutes to set up</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" style={{ color: '#8B5CF6' }} />
            <span className="text-text-primary">Your API keys are encrypted and never shared</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" style={{ color: '#FFD700' }} />
            <span className="text-text-primary">Trusted by developers worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}

