'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  Calculator,
  ExternalLink,
  Zap,
  DollarSign,
  Brain,
  Shield,
  Gauge,
  Eye,
  Code,
  FileText,
  Stethoscope,
  Scale,
  Users,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ProviderFlow } from '@/components/ui/provider-flow';

interface AIProvider {
  id: string;
  name: string;
  company: string;
  inputPrice: number; // per 1K tokens
  outputPrice: number; // per 1K tokens
  contextWindow: string;
  bestFor: string[];
  capabilities: string[];
  setupDifficulty: 'Easy' | 'Moderate' | 'Advanced';
  privacy: 'High' | 'Medium' | 'Low';
  speed: 'Fast' | 'Medium' | 'Slow';
  pricingUrl: string;
  docsUrl: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface UseCase {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  avgTokens: number;
  recommendedProviders: string[];
}

const aiProviders: AIProvider[] = [
  {
    id: 'ollama-llama32-3b',
    name: 'Llama 3.2 3B (Local)',
    company: 'Ollama',
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: '8K',
    bestFor: ['Privacy', 'HIPAA Compliance', 'General Use'],
    capabilities: ['Chat', 'Code Generation', 'Complete Privacy', 'Offline'],
    setupDifficulty: 'Easy',
    privacy: 'High',
    speed: 'Medium',
    pricingUrl: 'https://ollama.com',
    docsUrl: 'https://ollama.com/docs',
    description: 'Perfect balance of performance and efficiency for local processing',
    pros: ['Complete privacy', 'No API costs', 'HIPAA compliant', 'Good performance', 'Low memory usage (4GB)'],
    cons: ['Requires local setup', 'Smaller context than cloud models']
  },
  {
    id: 'ollama-llama32-1b',
    name: 'Llama 3.2 1B (Local)',
    company: 'Ollama',
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: '8K',
    bestFor: ['Low-Resource Devices', 'Fast Processing', 'Privacy'],
    capabilities: ['Chat', 'Basic Tasks', 'Complete Privacy', 'Offline'],
    setupDifficulty: 'Easy',
    privacy: 'High',
    speed: 'Fast',
    pricingUrl: 'https://ollama.com',
    docsUrl: 'https://ollama.com/docs',
    description: 'Lightweight model for devices with limited resources',
    pros: ['Fastest processing', 'Minimal memory (2GB)', 'Complete privacy', 'No API costs'],
    cons: ['Limited capability vs larger models', 'Basic reasoning only']
  },
  {
    id: 'ollama-llama33',
    name: 'Llama 3.3 (Local)',
    company: 'Ollama',
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: '128K',
    bestFor: ['Advanced Reasoning', 'Large Documents', 'Privacy'],
    capabilities: ['Advanced Chat', 'Code Generation', 'Large Context', 'Complete Privacy'],
    setupDifficulty: 'Moderate',
    privacy: 'High',
    speed: 'Slow',
    pricingUrl: 'https://ollama.com',
    docsUrl: 'https://ollama.com/docs',
    description: 'Most advanced local model with large context window',
    pros: ['Advanced reasoning', 'Large context window', 'Complete privacy', 'No API costs'],
    cons: ['High memory usage (8GB+)', 'Slower processing', 'Requires powerful hardware']
  },
  {
    id: 'ollama-codellama',
    name: 'CodeLlama (Local)',
    company: 'Ollama',
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: '16K',
    bestFor: ['Code Generation', 'Code Review', 'Development'],
    capabilities: ['Code Generation', 'Code Explanation', 'Bug Detection', 'Complete Privacy'],
    setupDifficulty: 'Easy',
    privacy: 'High',
    speed: 'Medium',
    pricingUrl: 'https://ollama.com',
    docsUrl: 'https://ollama.com/docs',
    description: 'Specialized model optimized for coding tasks',
    pros: ['Excellent code generation', 'Multiple programming languages', 'Complete privacy', 'No API costs'],
    cons: ['Limited to coding tasks', 'Moderate memory usage (6GB)']
  },
  {
    id: 'openai-gpt4o',
    name: 'GPT-4o',
    company: 'OpenAI',
    inputPrice: 0.0025,
    outputPrice: 0.01,
    contextWindow: '128K',
    bestFor: ['General AI Tasks', 'Code Generation', 'Creative Writing'],
    capabilities: ['Advanced Chat', 'Code Generation', 'Image Analysis', 'Fast Processing'],
    setupDifficulty: 'Easy',
    privacy: 'Medium',
    speed: 'Fast',
    pricingUrl: 'https://openai.com/pricing',
    docsUrl: 'https://platform.openai.com/docs',
    description: 'OpenAI\'s most advanced model with excellent performance across all tasks',
    pros: ['Excellent reasoning', 'Fast processing', 'Multimodal capabilities', 'Large ecosystem'],
    cons: ['No free tier', 'Requires payment method', 'Privacy concerns', '$0.02 per 1K output tokens']
  },
  {
    id: 'anthropic-claude3-haiku',
    name: 'Claude 3 Haiku',
    company: 'Anthropic',
    inputPrice: 0.00025,
    outputPrice: 0.00125,
    contextWindow: '200K',
    bestFor: ['Fast Tasks', 'Document Analysis', 'Cost-Effective AI'],
    capabilities: ['Fast Processing', 'Large Context', 'Document Analysis', 'Excellent Safety'],
    setupDifficulty: 'Easy',
    privacy: 'High',
    speed: 'Fast',
    pricingUrl: 'https://www.anthropic.com/pricing',
    docsUrl: 'https://docs.anthropic.com/',
    description: 'Fast and cost-effective model with $5 free credit for new users',
    pros: ['$5 free credit', 'Fastest Claude model', 'Large context window', 'Strong safety features'],
    cons: ['Free credit expires', 'Less capable than larger models']
  },
  {
    id: 'google-gemini-flash',
    name: 'Gemini 1.5 Flash',
    company: 'Google',
    inputPrice: 0.000075,
    outputPrice: 0.0003,
    contextWindow: '1M',
    bestFor: ['Free Usage', 'Large Documents', 'Multimodal Tasks'],
    capabilities: ['Huge Context', 'Multimodal', 'Free Tier', 'Document Processing'],
    setupDifficulty: 'Easy',
    privacy: 'Medium',
    speed: 'Fast',
    pricingUrl: 'https://ai.google.dev/pricing',
    docsUrl: 'https://ai.google.dev/docs',
    description: 'Google\'s fastest model with generous free tier (15 requests/minute)',
    pros: ['True free tier', 'Massive 1M context window', 'Multimodal capabilities', 'Very affordable'],
    cons: ['Rate limited on free tier', 'Privacy concerns with Google']
  }
];

const useCases: UseCase[] = [
  {
    id: 'medical',
    name: 'Medical Transcription',
    icon: Stethoscope,
    description: 'Convert audio recordings to SOAP notes - HIPAA compliant with local processing',
    avgTokens: 1000,
    recommendedProviders: ['ollama-llama32-3b', 'ollama-llama33', 'anthropic-claude3-haiku']
  },
  {
    id: 'legal',
    name: 'Contract Analysis',
    icon: Scale,
    description: 'Review contracts privately - attorney-client privilege protected',
    avgTokens: 5000,
    recommendedProviders: ['ollama-llama33', 'google-gemini-flash', 'anthropic-claude3-haiku']
  },
  {
    id: 'coding',
    name: 'Code Review',
    icon: Code,
    description: 'Analyze code without exposing intellectual property',
    avgTokens: 3000,
    recommendedProviders: ['ollama-codellama', 'openai-gpt4o', 'google-gemini-flash']
  },
  {
    id: 'personal',
    name: 'Personal Assistant',
    icon: Users,
    description: 'Private AI assistant for personal tasks and creative work',
    avgTokens: 2000,
    recommendedProviders: ['google-gemini-flash', 'ollama-llama32-3b', 'anthropic-claude3-haiku']
  }
];

export default function AIGuidePage() {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('medical');
  const [budget, setBudget] = useState<number>(20);
  const [calculatorResults, setCalculatorResults] = useState<any>(null);

  const calculateUsage = (useCase: UseCase, budget: number) => {
    const results = aiProviders.map(provider => {
      // Handle local models with zero cost
      if (provider.inputPrice === 0 && provider.outputPrice === 0) {
        return {
          provider: provider.name,
          sessions: 'Unlimited',
          cost: '$0 (hardware costs apply)',
          company: provider.company
        };
      }

      const tokensPerSession = useCase.avgTokens;
      const costPerSession = (provider.inputPrice * tokensPerSession * 0.7) + (provider.outputPrice * tokensPerSession * 0.3);
      const sessions = Math.floor(budget / (costPerSession / 1000));

      return {
        provider: provider.name,
        sessions: sessions.toLocaleString(),
        cost: `$${(costPerSession / 1000).toFixed(4)} per session`,
        company: provider.company
      };
    });

    setCalculatorResults(results);
  };

  const selectedUseCaseData = useCases.find(uc => uc.id === selectedUseCase);

  return (
      {/* Simple stars background with parallax scrolling */}
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Cosmara stellar background with cosmic gradients */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
           }}>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-hero-glass mb-4">
            <span className="text-glass-gradient">Local AI Guide</span>
          </h1>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Run AI models completely locally for maximum privacy, zero ongoing costs, and HIPAA compliance
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              🔒 100% Private
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
              💰 $0 API Costs
            </Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
              🏥 HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
              ✈️ Works Offline
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Local Models</p>
                  <p className="text-2xl font-bold">{aiProviders.length - 1}</p>
                  <p className="text-xs text-gray-500">Available now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">API Costs</p>
                  <p className="text-2xl font-bold">$0</p>
                  <p className="text-xs text-gray-500">Forever</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Privacy Level</p>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-gray-500">Local processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Use Cases</p>
                  <p className="text-2xl font-bold">{useCases.length}</p>
                  <p className="text-xs text-gray-500">Privacy-first</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Flow Visualization */}
        <ProviderFlow />

        {/* Cost Calculator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Local AI Cost Calculator
            </CardTitle>
            <CardDescription>
              Compare hardware costs vs ongoing API fees - local AI pays for itself quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="use-case">Use Case</Label>
                <select
                  id="use-case"
                  value={selectedUseCase}
                  onChange={(e) => setSelectedUseCase(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  {useCases.map(useCase => (
                    <option key={useCase.id} value={useCase.id}>
                      {useCase.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="20"
                  className="mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => selectedUseCaseData && calculateUsage(selectedUseCaseData, budget)}
                  className="w-full"
                >
                  Calculate Usage
                </Button>
              </div>
            </div>

            {selectedUseCaseData && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <selectedUseCaseData.icon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-semibold">{selectedUseCaseData.name}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedUseCaseData.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Estimated {selectedUseCaseData.avgTokens.toLocaleString()} tokens per session
                </p>
              </div>
            )}

            {calculatorResults && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculatorResults.map((result: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{result.provider}</h4>
                    <p className="text-xs text-gray-500 mb-2">{result.company}</p>
                    <p className="text-2xl font-bold text-green-600">{result.sessions}</p>
                    <p className="text-sm text-gray-600">sessions for ${budget}</p>
                    <p className="text-xs text-gray-500 mt-1">{result.cost}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Local AI Model Comparison</CardTitle>
            <CardDescription>
              Compare local AI models for privacy, performance, and resource requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold">Input Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Output Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Context</th>
                    <th className="text-left py-3 px-4 font-semibold">Best For</th>
                    <th className="text-left py-3 px-4 font-semibold">Setup</th>
                    <th className="text-left py-3 px-4 font-semibold">Privacy</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aiProviders.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-semibold">{provider.name}</h4>
                          <p className="text-sm text-gray-600">{provider.company}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {provider.inputPrice === 0 ? 'Free' : `$${provider.inputPrice.toFixed(4)}`}
                        {provider.inputPrice > 0 && <span className="text-xs text-gray-500 block">/1K tokens</span>}
                      </td>
                      <td className="py-4 px-4">
                        {provider.outputPrice === 0 ? 'Free' : `$${provider.outputPrice.toFixed(4)}`}
                        {provider.outputPrice > 0 && <span className="text-xs text-gray-500 block">/1K tokens</span>}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{provider.contextWindow}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.bestFor.slice(0, 2).map((use, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={provider.setupDifficulty === 'Easy' ? 'default' : 
                                  provider.setupDifficulty === 'Moderate' ? 'secondary' : 'destructive'}
                        >
                          {provider.setupDifficulty}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Shield className={`h-4 w-4 mr-1 ${
                            provider.privacy === 'High' ? 'text-green-600' :
                            provider.privacy === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                          <span className="text-sm">{provider.privacy}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={provider.pricingUrl} target="_blank" rel="noopener noreferrer">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Pricing
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Docs
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Use Case Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations by Use Case</CardTitle>
            <CardDescription>
              Find the best AI provider for your specific professional needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase) => {
                const recommendedProviders = aiProviders.filter(p => 
                  useCase.recommendedProviders.includes(p.id)
                );

                return (
                  <div key={useCase.id} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-3">
                      <useCase.icon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold">{useCase.name}</h3>
                        <p className="text-sm text-gray-600">{useCase.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Recommended Providers:</p>
                      {recommendedProviders.map((provider, idx) => (
                        <div key={provider.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({provider.company})</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {provider.inputPrice === 0 ? 'Free' : `$${provider.inputPrice.toFixed(4)}`}
                            </div>
                            <div className="text-xs text-gray-500">per 1K tokens</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <Info className="h-3 w-3 inline mr-1" />
                      Avg. {useCase.avgTokens.toLocaleString()} tokens per session
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}