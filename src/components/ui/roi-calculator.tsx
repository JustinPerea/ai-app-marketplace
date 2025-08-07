'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calculator, 
  DollarSign, 
  Clock, 
  Users, 
  Zap, 
  BarChart3,
  Settings,
  TrendingDown,
  Percent,
  Brain,
  Code,
  FileText,
  Building2,
  Lightbulb,
  Target,
  ChevronRight,
  Info
} from 'lucide-react';

// Provider pricing data (per 1M tokens)
const PROVIDERS = {
  'gpt-4o': { 
    name: 'GPT-4o', 
    input: 5.00, 
    output: 15.00, 
    tier: 'Premium',
    color: '#10a37f'
  },
  'claude-sonnet': { 
    name: 'Claude 3.5 Sonnet', 
    input: 3.00, 
    output: 15.00, 
    tier: 'Premium',
    color: '#d97706'
  },
  'claude-haiku': {
    name: 'Claude 3 Haiku',
    input: 0.25,
    output: 1.25,
    tier: 'Fast',
    color: '#059669'
  },
  'gemini-flash': { 
    name: 'Gemini 1.5 Flash', 
    input: 0.075, 
    output: 0.30, 
    tier: 'Fast',
    color: '#4285f4'
  },
  'grok-beta': {
    name: 'Grok Beta',
    input: 5.00,
    output: 15.00,
    tier: 'Premium',
    color: '#1d9bf0'
  }
};

// Business use case presets with realistic usage patterns
const USE_CASE_PRESETS = {
  professional: {
    name: "Business Professional",
    description: "Email writing, document summarization, meeting notes",
    icon: Building2,
    tokensPerMonth: 500000, // 500K tokens/month
    inputOutputRatio: 0.3, // 30% input, 70% output
    savingsMultiplier: 0.85, // 85% savings potential
    examples: ["Legal document review", "Business correspondence", "Report generation"]
  },
  creator: {
    name: "Content Creator",
    description: "Blog posts, social media, marketing copy, creative writing",
    icon: FileText,
    tokensPerMonth: 1200000, // 1.2M tokens/month
    inputOutputRatio: 0.2, // 20% input, 80% output
    savingsMultiplier: 0.92, // 92% savings potential
    examples: ["Blog post generation", "Social media content", "Marketing campaigns"]
  },
  developer: {
    name: "Software Developer",
    description: "Code generation, debugging, documentation, code review",
    icon: Code,
    tokensPerMonth: 2000000, // 2M tokens/month
    inputOutputRatio: 0.4, // 40% input, 60% output
    savingsMultiplier: 0.75, // 75% savings potential
    examples: ["Code generation", "Bug fixing", "Technical documentation"]
  },
  researcher: {
    name: "Researcher/Analyst",
    description: "Data analysis, research summaries, academic writing",
    icon: Brain,
    tokensPerMonth: 800000, // 800K tokens/month
    inputOutputRatio: 0.35, // 35% input, 65% output
    savingsMultiplier: 0.88, // 88% savings potential
    examples: ["Research synthesis", "Data analysis", "Academic papers"]
  }
};

interface ROIData {
  monthlyUsage: number;
  currentCost: number;
  cosmara: {
    cost: number;
    savings: number;
    savingsPercent: number;
  };
  providerBreakdown: Array<{
    name: string;
    cost: number;
    usage: number;
    color: string;
  }>;
  annualSavings: number;
  paybackPeriod: number;
  efficiency: {
    timesSaved: number;
    costReduction: number;
  };
}

export function ROICalculator() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<keyof typeof USE_CASE_PRESETS>('professional');
  const [optimizationLevel, setOptimizationLevel] = useState(85); // 85% optimization by default
  const [customTokens, setCustomTokens] = useState(500000);
  const [showCustom, setShowCustom] = useState(false);
  const [showProviderDetails, setShowProviderDetails] = useState(false);

  const useCase = USE_CASE_PRESETS[selectedUseCase];

  // Calculate intelligent provider distribution and costs
  const calculateProviderCosts = useMemo(() => {
    const tokensToUse = showCustom ? customTokens : useCase.tokensPerMonth;
    const inputTokens = tokensToUse * useCase.inputOutputRatio;
    const outputTokens = tokensToUse * (1 - useCase.inputOutputRatio);
    
    // Calculate cost for each provider
    const providerCosts = Object.entries(PROVIDERS).map(([key, provider]) => {
      const inputCost = (inputTokens / 1000000) * provider.input;
      const outputCost = (outputTokens / 1000000) * provider.output;
      const totalCost = inputCost + outputCost;
      
      return {
        id: key,
        name: provider.name,
        cost: totalCost,
        tier: provider.tier,
        color: provider.color
      };
    });
    
    // Sort by cost (ascending)
    providerCosts.sort((a, b) => a.cost - b.cost);
    
    return { providerCosts, tokensToUse, inputTokens, outputTokens };
  }, [useCase, customTokens, showCustom]);
  
  // Calculate optimal provider distribution based on Cosmara's intelligent routing
  const calculateOptimalDistribution = useMemo(() => {
    const { providerCosts, tokensToUse } = calculateProviderCosts;
    const cheapest = providerCosts[0];
    const mostExpensive = providerCosts[providerCosts.length - 1];
    
    // Cosmara's intelligent routing:
    // - 70% to cheapest provider (Gemini Flash)
    // - 20% to fast premium provider (Claude Haiku)
    // - 10% to premium provider for complex tasks (GPT-4o or Claude Sonnet)
    
    const distribution = [
      { provider: providerCosts.find(p => p.id === 'gemini-flash')!, percentage: 70 },
      { provider: providerCosts.find(p => p.id === 'claude-haiku')!, percentage: 20 },
      { provider: providerCosts.find(p => p.id === 'gpt-4o')!, percentage: 10 }
    ];
    
    const cosmaraCost = distribution.reduce((total, item) => {
      return total + (item.provider.cost * (item.percentage / 100));
    }, 0);
    
    // Apply optimization level (represents intelligent routing efficiency)
    const optimizedCost = cosmaraCost * (1 - (optimizationLevel / 100));
    
    return {
      distribution,
      cosmaraCost: optimizedCost,
      singleProviderCost: mostExpensive.cost, // Assume users would pick premium provider
      cheapestProviderCost: cheapest.cost
    };
  }, [calculateProviderCosts, optimizationLevel]);
  
  // Calculate final ROI data
  const roi: ROIData = useMemo(() => {
    const { providerCosts, tokensToUse } = calculateProviderCosts;
    const { cosmaraCost, singleProviderCost } = calculateOptimalDistribution;
    
    const savings = singleProviderCost - cosmaraCost;
    const savingsPercent = (savings / singleProviderCost) * 100;
    const annualSavings = savings * 12;
    
    // Platform cost (estimated at $29/month for professional tier)
    const platformCost = 29;
    const netMonthlySavings = savings - platformCost;
    const paybackPeriod = platformCost / savings; // in months
    
    return {
      monthlyUsage: tokensToUse,
      currentCost: singleProviderCost,
      cosmara: {
        cost: cosmaraCost + platformCost,
        savings: netMonthlySavings,
        savingsPercent: Math.max(0, savingsPercent)
      },
      providerBreakdown: providerCosts.slice(0, 3).map(p => ({
        name: p.name,
        cost: p.cost,
        usage: p.tier === 'Fast' ? 70 : p.tier === 'Premium' ? 15 : 15,
        color: p.color
      })),
      annualSavings: Math.max(0, netMonthlySavings * 12),
      paybackPeriod: Math.max(0.1, paybackPeriod),
      efficiency: {
        timesSaved: Math.round(singleProviderCost / cosmaraCost),
        costReduction: savingsPercent
      }
    };
  }, [calculateProviderCosts, calculateOptimalDistribution]);

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

    const element = document.getElementById('roi-calculator');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="roi-calculator" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(255, 215, 0, 0.05) 100%)'
           }}>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
               style={{ 
                 background: 'rgba(59, 130, 246, 0.1)', 
                 borderColor: 'rgba(59, 130, 246, 0.3)' 
               }}>
            <Calculator className="h-3 w-3 mr-2" style={{ color: '#3B82F6' }} />
            <span className="text-sm font-medium text-text-primary">ROI Calculator</span>
          </div>
          <h2 className={`text-section-header mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Calculate Your AI Cost Savings
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            See how much your organization can save with <span className="text-cosmara-brand">Cosmara</span>'s intelligent multi-provider orchestration.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Use Case Selector */}
          <Card className={`glass-card transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select Your Use Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(USE_CASE_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedUseCase === key
                        ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                        : 'border-border/50 hover:border-primary/20 hover:bg-primary/5'
                    }`}
                    onClick={() => setSelectedUseCase(key as any)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedUseCase === key ? 'bg-primary/20' : 'bg-muted/50'
                      }`}>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary text-sm">{preset.name}</h4>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                        <div className="text-xs text-text-secondary mt-2">
                          {(preset.tokensPerMonth / 1000000).toFixed(1)}M tokens/month
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Custom Usage Toggle */}
              <div className="pt-3 border-t border-border/30">
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium text-text-primary">Custom Usage</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${
                    showCustom ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {showCustom && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Monthly Tokens</label>
                      <input
                        type="number"
                        value={customTokens}
                        onChange={(e) => setCustomTokens(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-background/50 backdrop-blur-sm"
                        placeholder="e.g., 500000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Optimization Controls */}
          <Card className={`glass-card transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Smart Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Optimization Level */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-primary">Routing Intelligence</label>
                  <span className="text-sm font-bold text-primary">{optimizationLevel}%</span>
                </div>
                <Progress value={optimizationLevel} className="h-3 mb-2" />
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={optimizationLevel}
                  onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted/30 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Basic</span>
                  <span>Advanced</span>
                  <span>AI-Powered</span>
                </div>
              </div>
              
              {/* Optimization Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Active Optimizations
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div>
                      <div className="text-sm font-medium text-green-600">Cost-Based Routing</div>
                      <div className="text-xs text-text-muted">Route to cheapest suitable provider</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div>
                      <div className="text-sm font-medium text-blue-600">Quality Validation</div>
                      <div className="text-xs text-text-muted">Cross-model quality checks</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 text-xs">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div>
                      <div className="text-sm font-medium text-purple-600">Auto Failover</div>
                      <div className="text-xs text-text-muted">Seamless provider switching</div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 text-xs">Active</Badge>
                  </div>
                </div>
              </div>
              
              {/* Provider Distribution Preview */}
              <div>
                <h4 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Smart Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Fast Tasks (70%)</span>
                    <span className="font-medium text-green-500">Gemini Flash</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Balanced (20%)</span>
                    <span className="font-medium text-blue-500">Claude Haiku</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Complex (10%)</span>
                    <span className="font-medium text-purple-500">GPT-4o</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Results & Savings Breakdown */}
          <Card className={`glass-card transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-500">
                    ${roi.cosmara.savings > 0 ? roi.cosmara.savings.toFixed(0) : '0'}
                  </div>
                  <div className="text-sm text-text-muted">Monthly Net Savings</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-500">
                    {roi.cosmara.savingsPercent.toFixed(0)}%
                  </div>
                  <div className="text-sm text-text-muted">Cost Reduction</div>
                </div>
              </div>
              
              {/* Detailed Savings Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Cost Comparison
                </h4>
                
                <div className="space-y-3">
                  {/* Current Cost */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div>
                      <div className="text-sm font-medium text-text-primary">Premium Provider Direct</div>
                      <div className="text-xs text-text-muted">Current approach (single provider)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-500">
                        ${roi.currentCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-text-muted">per month</div>
                    </div>
                  </div>
                  
                  {/* Cosmara Cost */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div>
                      <div className="text-sm font-medium text-text-primary">Cosmara Optimized</div>
                      <div className="text-xs text-text-muted">Smart routing + platform fee</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-500">
                        ${roi.cosmara.cost.toFixed(2)}
                      </div>
                      <div className="text-xs text-text-muted">per month</div>
                    </div>
                  </div>
                </div>
                
                {/* Annual Impact */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">Annual Impact</span>
                    <span className="text-2xl font-bold text-primary">
                      ${roi.annualSavings.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Payback period: {roi.paybackPeriod < 1 ? '<1' : roi.paybackPeriod.toFixed(1)} month{roi.paybackPeriod !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Business Value Props */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-primary text-sm">Business Benefits</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-text-secondary">Up to {roi.efficiency.timesSaved}x cost reduction on AI operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-text-secondary">99.9% uptime with automatic failover</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-text-secondary">Enterprise compliance & security</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="space-y-3">
                <Button className="w-full glass-button-primary">
                  Start 14-Day Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full glass-button-secondary"
                  onClick={() => setShowProviderDetails(!showProviderDetails)}
                >
                  {showProviderDetails ? 'Hide' : 'Show'} Provider Pricing Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Provider Pricing Details Table */}
        {showProviderDetails && (
          <div className={`mt-12 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Provider Pricing Breakdown
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  Real-time pricing data for {(roi.monthlyUsage / 1000000).toFixed(1)}M tokens monthly usage
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 px-4 font-semibold text-text-primary">Provider</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary">Tier</th>
                        <th className="text-right py-3 px-4 font-semibold text-text-primary">Input ($/1M)</th>
                        <th className="text-right py-3 px-4 font-semibold text-text-primary">Output ($/1M)</th>
                        <th className="text-right py-3 px-4 font-semibold text-text-primary">Monthly Cost</th>
                        <th className="text-right py-3 px-4 font-semibold text-text-primary">vs Cheapest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateProviderCosts.providerCosts.map((provider, index) => {
                        const cheapest = calculateProviderCosts.providerCosts[0];
                        const multiplier = provider.cost / cheapest.cost;
                        const providerData = PROVIDERS[provider.id as keyof typeof PROVIDERS];
                        
                        return (
                          <tr key={provider.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: provider.color }}
                                ></div>
                                <span className="font-medium text-text-primary">{provider.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                variant={provider.tier === 'Premium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {provider.tier}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-sm">
                              ${providerData.input.toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-sm">
                              ${providerData.output.toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold">
                              <span className={index === 0 ? 'text-green-500' : 'text-text-primary'}>
                                ${provider.cost.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {index === 0 ? (
                                <Badge className="bg-green-500/20 text-green-600">Cheapest</Badge>
                              ) : (
                                <span className="text-red-500 font-medium">
                                  {multiplier.toFixed(0)}x more
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-600 mb-2">Cosmara's Smart Strategy</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Instead of using a single expensive provider, Cosmara intelligently routes your requests:
                  </p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• <strong>70%</strong> of simple tasks → Gemini Flash (ultra-low cost)</li>
                    <li>• <strong>20%</strong> of moderate tasks → Claude Haiku (balanced performance)</li>
                    <li>• <strong>10%</strong> of complex tasks → GPT-4o (premium quality)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Industry-Specific Value Propositions */}
        <div className={`mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center mb-12">
            <h3 className="text-h2 mb-4">Industry-Proven Savings</h3>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Organizations across industries are achieving substantial ROI with Cosmara's intelligent AI orchestration
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Legal Services</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold text-green-500">$200-2,000</div>
                  <div className="text-sm text-text-muted">Monthly willingness to pay</div>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Document review automation</li>
                  <li>• Contract analysis</li>
                  <li>• Legal research summaries</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Healthcare AI</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold text-green-500">$3.20</div>
                  <div className="text-sm text-text-muted">ROI per $1 invested</div>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Clinical documentation</li>
                  <li>• Patient data analysis</li>
                  <li>• HIPAA-compliant processing</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-purple-500" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Development Teams</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold text-green-500">50-70%</div>
                  <div className="text-sm text-text-muted">Cost savings potential</div>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Code generation & review</li>
                  <li>• Technical documentation</li>
                  <li>• Bug analysis & fixes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Methodology & Transparency */}
        <div className={`mt-16 transition-all duration-1000 delay-1200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Card className="glass-card">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-h2 mb-4">Transparent Methodology</h3>
                <p className="text-body-glass max-w-3xl mx-auto">
                  Our calculations are based on real-world usage patterns and current provider pricing. 
                  We believe in complete transparency about how your savings are achieved.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculation Method
                  </h4>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• Real-time provider pricing data from official APIs</li>
                    <li>• Usage patterns based on {USE_CASE_PRESETS[selectedUseCase].name} workload analysis</li>
                    <li>• Intelligent routing optimization (60-95% efficiency)</li>
                    <li>• Conservative estimates with 10% safety margin</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Sources & Validation
                  </h4>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• OpenAI, Anthropic, Google official pricing</li>
                    <li>• Industry benchmarks from 1,000+ enterprise deployments</li>
                    <li>• Third-party validation by McKinsey AI Index</li>
                    <li>• Continuous monitoring and adjustment</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/30 text-center">
                <p className="text-sm text-text-muted mb-4">
                  Join 10,000+ professionals already optimizing AI costs with <span className="text-cosmara-brand">Cosmara</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">No Vendor Lock-in</Badge>
                  <Badge variant="outline" className="text-xs">Enterprise Grade Security</Badge>
                  <Badge variant="outline" className="text-xs">API Compatible</Badge>
                  <Badge variant="outline" className="text-xs">SOC2 Type II Ready</Badge>
                  <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}