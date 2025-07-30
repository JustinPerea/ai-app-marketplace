'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  DollarSign, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface ProviderStep {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  metrics: {
    cost: string;
    speed: string;
    quality: string;
    privacy: string;
  };
  status: 'active' | 'selected' | 'fallback';
  color: string;
}

export function ProviderFlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'analyze' | 'route' | 'complete'>('analyze');

  const providers: ProviderStep[] = [
    {
      id: 'local',
      name: 'Local Ollama',
      icon: Shield,
      description: 'HIPAA-compliant local processing',
      metrics: {
        cost: '$0.00',
        speed: '8-12s',
        quality: 'Good',
        privacy: '10/10'
      },
      status: 'active',
      color: '#10B981'
    },
    {
      id: 'claude',
      name: 'Claude 3.5 Sonnet',
      icon: Brain,
      description: 'Superior reasoning and analysis',
      metrics: {
        cost: '$0.015',
        speed: '3-4s',
        quality: 'Excellent',
        privacy: '8/10'
      },
      status: 'selected',
      color: '#8B5CF6'
    },
    {
      id: 'gpt4',
      name: 'GPT-4o',
      icon: Zap,
      description: 'Fast general-purpose processing',
      metrics: {
        cost: '$0.020',
        speed: '2-3s',
        quality: 'Very Good',
        privacy: '6/10'
      },
      status: 'fallback',
      color: '#3B82F6'
    },
    {
      id: 'gemini',
      name: 'Gemini 2.5 Pro',
      icon: Activity,
      description: 'Multimodal capabilities',
      metrics: {
        cost: '$0.007',
        speed: '2-3s',
        quality: 'Very Good',
        privacy: '6/10'
      },
      status: 'active',
      color: '#F59E0B'
    }
  ];

  const scenarios = [
    {
      name: 'Medical Data Processing',
      requirement: 'HIPAA Compliance Required',
      selected: 'local',
      reason: 'Privacy requirement mandates local processing'
    },
    {
      name: 'Code Review Analysis',
      requirement: 'Best Quality & Speed Balance',
      selected: 'claude',
      reason: 'Superior reasoning with acceptable speed'
    },
    {
      name: 'Content Generation',
      requirement: 'Cost Optimization Priority',
      selected: 'gemini',
      reason: 'Lowest cost with good quality'
    }
  ];

  const [activeScenario, setActiveScenario] = useState(0);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('provider-flow');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => {
        if (prev === 'analyze') return 'route';
        if (prev === 'route') return 'complete';
        return 'analyze';
      });
      
      if (animationPhase === 'complete') {
        setActiveScenario(prev => (prev + 1) % scenarios.length);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, animationPhase]);

  const getProviderStatus = (providerId: string) => {
    const scenario = scenarios[activeScenario];
    if (providerId === scenario.selected) return 'selected';
    return 'active';
  };

  return (
    <section id="provider-flow" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.03) 50%, rgba(16, 185, 129, 0.05) 100%)'
           }}>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
               style={{ 
                 background: 'rgba(139, 92, 246, 0.1)', 
                 borderColor: 'rgba(139, 92, 246, 0.3)' 
               }}>
            <Brain className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
            <span className="text-sm font-medium text-text-primary">Intelligent Routing</span>
          </div>
          <h2 className={`text-section-header mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            See Multi-Provider Orchestration in Action
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Watch how Cosmara intelligently routes your AI requests based on cost, quality, speed, and privacy requirements
          </p>
        </div>

        {/* Scenario Selector */}
        <div className={`mb-12 transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setActiveScenario(index)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  activeScenario === index
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border/50 text-text-muted hover:border-primary/20'
                }`}
              >
                <span className="font-medium">{scenario.name}</span>
              </button>
            ))}
          </div>
          
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {scenarios[activeScenario].name}
              </h3>
              <p className="text-text-secondary mb-3">
                {scenarios[activeScenario].requirement}
              </p>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {scenarios[activeScenario].reason}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Provider Flow Visualization */}
        <div className={`transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {providers.map((provider, index) => {
              const Icon = provider.icon;
              const status = getProviderStatus(provider.id);
              const isSelected = status === 'selected';
              
              return (
                <Card
                  key={provider.id}
                  className={`glass-card relative transition-all duration-500 ${
                    isSelected && animationPhase === 'route'
                      ? 'ring-2 ring-primary/50 shadow-lg scale-105'
                      : ''
                  }`}
                >
                  {isSelected && animationPhase === 'route' && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Selected
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${provider.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: provider.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">{provider.name}</h4>
                        <p className="text-xs text-text-muted">{provider.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Cost:</span>
                        <span className="font-medium text-text-primary">{provider.metrics.cost}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Speed:</span>
                        <span className="font-medium text-text-primary">{provider.metrics.speed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Quality:</span>
                        <span className="font-medium text-text-primary">{provider.metrics.quality}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Privacy:</span>
                        <span className="font-medium text-text-primary">{provider.metrics.privacy}</span>
                      </div>
                    </div>
                    
                    {isSelected && animationPhase === 'complete' && (
                      <div className="mt-4 flex items-center justify-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Processing Complete</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Decision Flow Animation */}
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`flex items-center transition-all duration-500 ${
                    animationPhase === 'analyze' ? 'text-primary' : 'text-text-muted'
                  }`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                      {animationPhase === 'analyze' ? (
                        <Brain className="h-4 w-4 animate-pulse" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="font-medium">Analyze Requirements</span>
                  </div>
                  
                  <ArrowRight className={`h-5 w-5 transition-all duration-500 ${
                    animationPhase === 'route' ? 'text-primary animate-pulse' : 'text-text-muted'
                  }`} />
                  
                  <div className={`flex items-center transition-all duration-500 ${
                    animationPhase === 'route' ? 'text-primary' : 'text-text-muted'
                  }`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                      {animationPhase === 'route' ? (
                        <Zap className="h-4 w-4 animate-pulse" />
                      ) : animationPhase === 'complete' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span className="font-medium">Route Request</span>
                  </div>
                  
                  <ArrowRight className={`h-5 w-5 transition-all duration-500 ${
                    animationPhase === 'complete' ? 'text-primary animate-pulse' : 'text-text-muted'
                  }`} />
                  
                  <div className={`flex items-center transition-all duration-500 ${
                    animationPhase === 'complete' ? 'text-green-500' : 'text-text-muted'
                  }`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3">
                      {animationPhase === 'complete' ? (
                        <CheckCircle className="h-4 w-4 animate-pulse" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="font-medium">Deliver Results</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-text-secondary">
                    {animationPhase === 'analyze' && 'Analyzing cost, quality, speed, and privacy requirements...'}
                    {animationPhase === 'route' && `Routing to ${providers.find(p => p.id === scenarios[activeScenario].selected)?.name}...`}
                    {animationPhase === 'complete' && `Request processed successfully with optimal cost and quality!`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className={`mt-12 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h4 className="font-semibold text-text-primary mb-2">Cost Optimization</h4>
              <p className="text-text-secondary text-sm">
                Save up to 40% by automatically choosing the most cost-effective provider for each task
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Shield className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h4 className="font-semibold text-text-primary mb-2">Privacy-Aware</h4>
              <p className="text-text-secondary text-sm">
                Automatically route sensitive data to local processing for HIPAA compliance
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Activity className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <h4 className="font-semibold text-text-primary mb-2">Quality Assurance</h4>
              <p className="text-text-secondary text-sm">
                Cross-provider validation ensures the highest quality outputs for critical tasks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}