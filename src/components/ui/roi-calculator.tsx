'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, DollarSign, Clock, Users, Zap } from 'lucide-react';

interface ROIData {
  currentCost: number;
  aiCalls: number;
  developers: number;
  savings: number;
  timeToROI: number;
  efficiency: number;
}

export function ROICalculator() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<'startup' | 'enterprise' | 'custom'>('startup');
  const [customValues, setCustomValues] = useState({
    aiCalls: 10000,
    developers: 5,
    currentSpend: 2000
  });

  const presets = {
    startup: {
      name: "Growing Startup",
      aiCalls: 10000,
      developers: 5,
      currentSpend: 2000
    },
    enterprise: {
      name: "Enterprise Team",
      aiCalls: 100000,
      developers: 25,
      currentSpend: 15000
    },
    custom: {
      name: "Custom Setup",
      aiCalls: customValues.aiCalls,
      developers: customValues.developers,
      currentSpend: customValues.currentSpend
    }
  };

  const calculateROI = () => {
    const preset = presets[selectedCompany];
    const monthlySavings = preset.currentSpend * 0.4; // 40% savings
    const platformCost = 99 * preset.developers; // $99 per developer
    const netSavings = monthlySavings - platformCost;
    const annualSavings = netSavings * 12;
    const efficiencyGain = preset.developers * 8; // 8 hours saved per developer per month
    
    return {
      currentCost: preset.currentSpend,
      aiCalls: preset.aiCalls,
      developers: preset.developers,
      savings: netSavings,
      timeToROI: platformCost / monthlySavings,
      efficiency: efficiencyGain,
      annualSavings
    };
  };

  const roi = calculateROI();

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

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Company Size Selector */}
          <Card className={`glass-card transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Choose Your Company Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(presets).map(([key, preset]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCompany === key
                      ? 'bg-primary/10 border-primary/30'
                      : 'border-border/50 hover:border-primary/20'
                  }`}
                  onClick={() => setSelectedCompany(key as any)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary">{preset.name}</h4>
                      <p className="text-sm text-text-muted">
                        {preset.developers} developers • {(preset.aiCalls / 1000).toLocaleString()}K AI calls/month
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${preset.currentSpend.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-text-muted">Current AI spend</div>
                    </div>
                  </div>
                  
                  {key === 'custom' && selectedCompany === 'custom' && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-text-muted">AI Calls/month</label>
                        <input
                          type="number"
                          value={customValues.aiCalls}
                          onChange={(e) => setCustomValues(prev => ({ ...prev, aiCalls: parseInt(e.target.value) || 0 }))}
                          className="w-full mt-1 px-2 py-1 text-sm rounded border bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Developers</label>
                        <input
                          type="number"
                          value={customValues.developers}
                          onChange={(e) => setCustomValues(prev => ({ ...prev, developers: parseInt(e.target.value) || 0 }))}
                          className="w-full mt-1 px-2 py-1 text-sm rounded border bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Current Spend</label>
                        <input
                          type="number"
                          value={customValues.currentSpend}
                          onChange={(e) => setCustomValues(prev => ({ ...prev, currentSpend: parseInt(e.target.value) || 0 }))}
                          className="w-full mt-1 px-2 py-1 text-sm rounded border bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ROI Results */}
          <Card className={`glass-card transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Savings Potential
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-500">
                    ${roi.savings > 0 ? roi.savings.toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-text-muted">Monthly Net Savings</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-500">
                    {roi.timeToROI.toFixed(1)} mo
                  </div>
                  <div className="text-sm text-text-muted">Time to ROI</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Annual Savings</span>
                  <span className="font-semibold text-green-500">
                    ${(roi.savings * 12).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Development Hours Saved</span>
                  <span className="font-semibold text-blue-500">
                    {roi.efficiency}h/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Cost Reduction</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    40% Average
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">Multi-Provider Benefits</span>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Automatic failover when providers are down</li>
                  <li>• Cost optimization across OpenAI, Claude, Gemini</li>
                  <li>• Quality validation through model consensus</li>
                  <li>• HIPAA-compliant local processing when needed</li>
                </ul>
              </div>

              <Button className="w-full glass-button-primary">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className={`text-center mt-12 transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-sm text-text-muted mb-4">
            Join 10,000+ developers already saving on AI costs with <span className="text-cosmara-brand">Cosmara</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="text-xs">No Lock-in</Badge>
            <Badge variant="outline" className="text-xs">Enterprise Grade</Badge>
            <Badge variant="outline" className="text-xs">API Compatible</Badge>
            <Badge variant="outline" className="text-xs">SOC2 Ready</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}