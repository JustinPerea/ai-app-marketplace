'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  Zap,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Loader2,
  CreditCard,
  Key
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  estimatedTime: string;
  instructions: string[];
  tips?: string[];
  troubleshooting?: { issue: string; solution: string }[];
}

interface Provider {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  keyFormat: string;
  estimatedCost: string;
  savings: string;
  url: string;
}

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, DALL-E models',
    logo: '🤖',
    color: 'bg-green-500',
    keyFormat: 'sk-...',
    estimatedCost: '$20-50/month',
    savings: '60-75%',
    url: 'https://platform.openai.com'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 Opus, Sonnet, Haiku',
    logo: '🧠',
    color: 'bg-orange-500',
    keyFormat: 'sk-ant-...',
    estimatedCost: '$15-40/month',
    savings: '65-80%',
    url: 'https://console.anthropic.com'
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini Pro, Gemini Vision',
    logo: '🔍',
    color: 'bg-blue-500',
    keyFormat: 'AIza...',
    estimatedCost: '$5-20/month',
    savings: '80-95%',
    url: 'https://console.cloud.google.com'
  }
];

interface VisualConnectionGuideProps {
  providerId: string;
  onComplete?: (apiKey: string) => void;
  onCancel?: () => void;
}

export function VisualConnectionGuide({ providerId, onComplete, onCancel }: VisualConnectionGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [keyName, setKeyName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const provider = providers.find(p => p.id === providerId);
  
  if (!provider) {
    return <div>Provider not found</div>;
  }

  const getSteps = (provider: Provider): Step[] => {
    switch (provider.id) {
      case 'openai':
        return [
          {
            id: 'account',
            title: 'Create OpenAI Account',
            description: 'Sign up for a free OpenAI developer account',
            icon: <Key className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '2 min',
            instructions: [
              'Visit OpenAI Platform',
              'Click "Sign up" in top right',
              'Enter your email and create password',
              'Verify your email address',
              'Complete profile setup'
            ],
            tips: [
              'Use a business email for easier billing setup',
              'Keep your password secure - you\'ll need it for billing'
            ]
          },
          {
            id: 'billing',
            title: 'Add Payment Method',
            description: 'Required to use OpenAI API - you pay directly to OpenAI',
            icon: <CreditCard className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '3 min',
            instructions: [
              'Click "Billing" in left sidebar',
              'Click "Add payment method"',
              'Enter credit card information',
              'Set monthly usage limit ($50-100 recommended)',
              'Save payment method'
            ],
            tips: [
              'Start with a low limit to control costs',
              'You can increase limits later as needed'
            ],
            troubleshooting: [
              {
                issue: 'Payment method rejected',
                solution: 'Ensure billing address matches card exactly'
              }
            ]
          },
          {
            id: 'api-key',
            title: 'Generate API Key',
            description: 'Create your secure connection key',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Click "API keys" in left sidebar',
              'Click "Create new secret key"',
              'Name it "AI Marketplace Connection"',
              'Set permissions to "All" (default)',
              'Click "Create secret key"',
              'IMPORTANT: Copy key immediately (starts with "sk-")'
            ],
            tips: [
              'You can only see the key once - copy it now!',
              'Store it securely until you paste it here'
            ]
          },
          {
            id: 'connect',
            title: 'Connect to Marketplace',
            description: 'Test your connection and start saving money',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Paste your API key below',
              'Give it a memorable name',
              'Click "Test Connection"',
              'Verify successful connection'
            ]
          }
        ];
      
      case 'anthropic':
        return [
          {
            id: 'account',
            title: 'Create Anthropic Account',
            description: 'Sign up for Claude API access',
            icon: <Key className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '2 min',
            instructions: [
              'Visit Anthropic Console',
              'Click "Sign Up"',
              'Enter email and create password',
              'Verify email address',
              'Complete account setup'
            ]
          },
          {
            id: 'api-access',
            title: 'Request API Access',
            description: 'Anthropic reviews API access requests (usually approved quickly)',
            icon: <Clock className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1-3 days',
            instructions: [
              'Navigate to "API" section',
              'Click "Request Access"',
              'Fill out use case form',
              'Mention "AI application development"',
              'Wait for approval email'
            ],
            tips: [
              'Most requests approved within 24 hours',
              'Be specific about your intended use case'
            ]
          },
          {
            id: 'billing',
            title: 'Add Payment Method',
            description: 'Add billing to start using Claude',
            icon: <CreditCard className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '2 min',
            instructions: [
              'Go to "Billing" section',
              'Click "Add payment method"',
              'Enter credit card details',
              'Set usage limits ($50-100 recommended)',
              'Save payment information'
            ]
          },
          {
            id: 'api-key',
            title: 'Generate API Key',
            description: 'Create your Claude connection key',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Navigate to "API Keys" section',
              'Click "Create Key"',
              'Name: "AI Marketplace Connection"',
              'Set permissions to default (all models)',
              'Click "Create"',
              'Copy key immediately (starts with "sk-ant-")'
            ]
          },
          {
            id: 'connect',
            title: 'Connect to Marketplace',
            description: 'Test connection and enjoy Claude\'s capabilities',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Paste your API key below',
              'Give it a memorable name',
              'Click "Test Connection"',
              'Verify successful connection'
            ]
          }
        ];

      case 'google':
        return [
          {
            id: 'cloud-setup',
            title: 'Google Cloud Setup',
            description: 'Create a Google Cloud project',
            icon: <Key className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '3 min',
            instructions: [
              'Go to Google Cloud Console',
              'Sign in with Google account',
              'Click "New Project"',
              'Name: "AI Marketplace Connection"',
              'Click "Create"'
            ]
          },
          {
            id: 'billing',
            title: 'Enable Billing',
            description: 'Link payment method to your project',
            icon: <CreditCard className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '2 min',
            instructions: [
              'Go to "Billing" section',
              'Add payment method',
              'Link billing account to project',
              'Set budget alerts (recommended)'
            ]
          },
          {
            id: 'enable-api',
            title: 'Enable AI API',
            description: 'Activate Generative AI capabilities',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Navigate to "APIs & Services" > "Library"',
              'Search "Generative Language API"',
              'Click on the API',
              'Click "Enable"',
              'Wait for activation (30-60 seconds)'
            ]
          },
          {
            id: 'api-key',
            title: 'Create API Key',
            description: 'Generate your Google AI key',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '2 min',
            instructions: [
              'Go to "APIs & Services" > "Credentials"',
              'Click "Create Credentials" > "API Key"',
              'Copy generated key (starts with "AIza")',
              'Click "Restrict Key" (recommended)',
              'Select "Generative Language API"',
              'Save restrictions'
            ]
          },
          {
            id: 'connect',
            title: 'Connect to Marketplace',
            description: 'Complete your Google AI integration',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            estimatedTime: '1 min',
            instructions: [
              'Paste your API key below',
              'Give it a memorable name',
              'Click "Test Connection"',
              'Verify successful connection'
            ]
          }
        ];

      default:
        return [];
    }
  };

  const steps = getSteps(provider);
  const totalProgress = ((currentStep + 1) / steps.length) * 100;

  const validateApiKey = async () => {
    setIsValidating(true);
    setValidationResult(null);

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Basic format validation
    const isValidFormat = (() => {
      switch (provider.id) {
        case 'openai':
          return apiKey.startsWith('sk-') && apiKey.length > 20;
        case 'anthropic':
          return apiKey.startsWith('sk-ant-') && apiKey.length > 30;
        case 'google':
          return apiKey.startsWith('AIza') && apiKey.length > 20;
        default:
          return false;
      }
    })();

    setValidationResult(isValidFormat ? 'success' : 'error');
    setIsValidating(false);

    if (isValidFormat && onComplete) {
      setTimeout(() => onComplete(apiKey), 1000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 rounded-full text-white text-2xl"
               style={{ background: provider.color === 'bg-stellar-purple' ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 
                                    provider.color === 'bg-solar-flare' ? 'linear-gradient(135deg, #FF6B35, #F59E0B)' :
                                    'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
            {provider.logo}
          </div>
          <div>
            <h1 className="text-hero-glass text-text-primary">Connect {provider.name}</h1>
            <p className="text-body-glass">{provider.description}</p>
          </div>
        </div>
        
        {/* Benefits Bar */}
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" style={{ color: '#FFD700' }} />
            <span className="text-text-primary">Save {provider.savings}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" style={{ color: '#3B82F6' }} />
            <span className="text-text-primary">Encrypted Storage</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" style={{ color: '#8B5CF6' }} />
            <span className="text-text-primary">~10 min setup</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-text-muted mb-2">
            <span>Progress</span>
            <span>{Math.round(totalProgress)}% complete</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`glass-card transition-all duration-200 ${
              index === currentStep ? 'ring-2 shadow-lg' : ''
            }`}
            style={{
              ...(index === currentStep && { 
                borderColor: '#8B5CF6',
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.3), 0 16px 48px rgba(0, 0, 0, 0.3)'
              }),
              ...(index < currentStep && {
                background: 'rgba(255, 215, 0, 0.1)',
                borderColor: 'rgba(255, 215, 0, 0.3)'
              })
            }}
          >
            <div 
              className="p-6 cursor-pointer" 
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full"
                       style={{
                         background: index < currentStep ? 'linear-gradient(135deg, #FFD700, #FF6B35)' :
                                    index === currentStep ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' :
                                    'rgba(139, 92, 246, 0.2)',
                         color: index < currentStep || index === currentStep ? 'white' : '#8B5CF6'
                       }}>
                    {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                  </div>
                  <div>
                    <h3 className="text-h3 text-text-primary">{step.title}</h3>
                    <p className="text-body-glass">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 rounded-full text-xs font-medium border"
                       style={{
                         background: 'rgba(59, 130, 246, 0.1)',
                         borderColor: 'rgba(59, 130, 246, 0.3)',
                         color: '#3B82F6'
                       }}>
                    {step.estimatedTime}
                  </div>
                  {expandedStep === step.id ? <ChevronDown className="h-4 w-4 text-text-secondary" /> : <ChevronRight className="h-4 w-4 text-text-secondary" />}
                </div>
              </div>
            </div>

            {(expandedStep === step.id || index === currentStep) && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium mb-2 text-text-primary">Instructions:</h4>
                    <ol className="space-y-2">
                      {step.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full min-w-[24px] text-center font-medium"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#3B82F6'
                                }}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-text-secondary">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {step.tips && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                      <h4 className="font-medium text-text-primary mb-2">💡 Tips:</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-text-secondary">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Troubleshooting */}
                  {step.troubleshooting && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 165, 0, 0.1)' }}>
                      <h4 className="font-medium text-text-primary mb-2">⚠️ Common Issues:</h4>
                      {step.troubleshooting.map((item, i) => (
                        <div key={i} className="text-sm text-text-secondary mb-2">
                          <div className="font-medium">{item.issue}</div>
                          <div>{item.solution}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {step.id !== 'connect' && (
                      <button 
                        onClick={() => window.open(provider.url, '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open {provider.name}</span>
                      </button>
                    )}
                    
                    {index === currentStep && step.id !== 'connect' && (
                      <button 
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-4 py-2 rounded-lg font-medium border-2 transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          borderColor: '#3B82F6',
                          color: '#3B82F6'
                        }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* API Key Input (shown when on final step) */}
      {currentStep >= steps.length - 1 && (
        <div className="glass-card p-6" style={{ borderColor: 'rgba(255, 215, 0, 0.3)' }}>
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5" style={{ color: '#FFD700' }} />
              <h3 className="text-h3 text-text-primary">Final Step: Connect Your API Key</h3>
            </div>
            <p className="text-body-glass">
              Your key will be encrypted and stored securely with industry-standard encryption
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">Key Name</label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder={`${provider.name} Production Key`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">
                API Key (starts with {provider.keyFormat})
              </label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here"
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 rounded hover:bg-opacity-20"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    {showKey ? <EyeOff className="h-4 w-4 text-text-secondary" /> : <Eye className="h-4 w-4 text-text-secondary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(apiKey)}
                    className="p-1 rounded hover:bg-opacity-20"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <Copy className="h-4 w-4 text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Result */}
            {validationResult === 'success' && (
              <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' }}>
                <CheckCircle2 className="h-5 w-5" />
                <span>Connection successful! 🎉</span>
              </div>
            )}

            {validationResult === 'error' && (
              <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35' }}>
                <AlertCircle className="h-5 w-5" />
                <span>Connection failed. Please check your API key format.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={validateApiKey}
                disabled={!apiKey || !keyName || isValidating}
                className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                style={{ 
                  background: (!apiKey || !keyName || isValidating) ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                  color: 'white',
                  boxShadow: (!apiKey || !keyName || isValidating) ? 'none' : '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
                  cursor: (!apiKey || !keyName || isValidating) ? 'not-allowed' : 'pointer'
                }}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <span>Test & Connect</span>
                )}
              </button>
              {onCancel && (
                <button onClick={onCancel} className="px-4 py-2 rounded-lg font-medium border-2 transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          borderColor: '#3B82F6',
                          color: '#3B82F6'
                        }}>
                  Cancel
                </button>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-0.5" style={{ color: '#3B82F6' }} />
                <div>
                  <div className="font-medium text-text-primary">Your security is our priority</div>
                  <div className="text-text-secondary">API keys are encrypted with secure key storage and never stored in plain text</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}