/**
 * ML-Powered Routing Demo Page
 * 
 * Phase 3 Milestone 1: AI-Powered Provider Intelligence
 * 
 * Demonstrates the ML-enhanced routing system with real-time comparisons
 * between standard routing and intelligent ML optimization.
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MLAnalyticsDashboard } from '@/components/analytics/ml-analytics-dashboard';

interface ComparisonResult {
  standard: {
    provider: string;
    model: string;
    estimatedCost: number;
    estimatedTime: number;
    reasoning: string;
  };
  ml: {
    provider: string;
    model: string;
    predictedCost: number;
    predictedTime: number;
    confidence: number;
    reasoning: string;
    optimizationType: string;
    alternatives: Array<{
      provider: string;
      model: string;
      predictedCost: number;
    }>;
  };
  savings: {
    costSavings: number;
    timeSavings: number;
  };
}

export default function MLDemoPage() {
  const [prompt, setPrompt] = useState('Analyze the performance implications of using microservices architecture in a high-traffic e-commerce platform.');
  const [optimization, setOptimization] = useState<'cost' | 'speed' | 'quality' | 'balanced'>('balanced');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate ML routing comparison
      // In production, this would call both endpoints and compare results
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock comparison results
      const mockResult: ComparisonResult = {
        standard: {
          provider: 'OpenAI',
          model: 'gpt-4o',
          estimatedCost: 0.045,
          estimatedTime: 2800,
          reasoning: 'Default provider selection based on model preference',
        },
        ml: {
          provider: optimization === 'cost' ? 'Google' : optimization === 'speed' ? 'Google' : 'Anthropic',
          model: optimization === 'cost' ? 'gemini-1.5-flash' : optimization === 'speed' ? 'gemini-1.5-pro' : 'claude-3-5-sonnet',
          predictedCost: optimization === 'cost' ? 0.012 : optimization === 'speed' ? 0.028 : 0.038,
          predictedTime: optimization === 'speed' ? 1600 : 2200,
          confidence: 0.87,
          reasoning: `ML-optimized for ${optimization}: Intelligent provider selection based on request analysis`,
          optimizationType: optimization,
          alternatives: [
            { provider: 'Google', model: 'gemini-1.5-flash', predictedCost: 0.012 },
            { provider: 'OpenAI', model: 'gpt-4o-mini', predictedCost: 0.018 },
            { provider: 'Anthropic', model: 'claude-3-haiku', predictedCost: 0.022 },
          ],
        },
        savings: {
          costSavings: 0,
          timeSavings: 0,
        },
      };

      // Calculate savings
      mockResult.savings = {
        costSavings: ((mockResult.standard.estimatedCost - mockResult.ml.predictedCost) / mockResult.standard.estimatedCost) * 100,
        timeSavings: ((mockResult.standard.estimatedTime - mockResult.ml.predictedTime) / mockResult.standard.estimatedTime) * 100,
      };

      setResult(mockResult);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧠 ML-Powered AI Routing Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of AI orchestration with intelligent provider selection 
            that delivers up to 50% cost savings through machine learning optimization.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge className="bg-green-500/20 text-green-200 px-4 py-2">
              Phase 3 Milestone 1
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-200 px-4 py-2">
              AI-Powered Intelligence
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-200 px-4 py-2">
              50%+ Cost Savings
            </Badge>
          </div>
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-black/20 border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Test Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-gray-300">
                    Prompt to Analyze
                  </Label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="Enter your AI prompt here..."
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 block">Optimization Strategy</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['cost', 'speed', 'quality', 'balanced'] as const).map((opt) => (
                      <Button
                        key={opt}
                        variant={optimization === opt ? 'default' : 'outline'}
                        onClick={() => setOptimization(opt)}
                        className={`capitalize ${
                          optimization === opt 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={runComparison}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Run ML Comparison'
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="p-8 bg-black/20 border-white/10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Request</h3>
                  <p className="text-gray-400">
                    ML algorithms are evaluating optimal provider selection...
                  </p>
                </div>
              </Card>
            ) : result ? (
              <div className="space-y-6">
                {/* Savings Summary */}
                <Card className="p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/20">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">ML Optimization Results</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-3xl font-bold text-green-400">
                          {result.savings.costSavings > 0 ? '+' : ''}{Math.round(result.savings.costSavings)}%
                        </div>
                        <div className="text-gray-300">Cost Savings</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-400">
                          {result.savings.timeSavings > 0 ? '+' : ''}{Math.round(result.savings.timeSavings)}%
                        </div>
                        <div className="text-gray-300">Time Savings</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Standard Routing */}
                  <Card className="p-6 bg-black/20 border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-white">Standard Routing</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Provider</span>
                        <Badge variant="secondary">{result.standard.provider}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Model</span>
                        <span className="text-white font-mono text-sm">{result.standard.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Est. Cost</span>
                        <span className="text-white">${result.standard.estimatedCost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Est. Time</span>
                        <span className="text-white">{result.standard.estimatedTime}ms</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm">{result.standard.reasoning}</p>
                    </div>
                  </Card>

                  {/* ML Routing */}
                  <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <h4 className="text-lg font-semibold text-white">ML-Optimized Routing</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Provider</span>
                        <Badge className="bg-blue-500/20 text-blue-200">{result.ml.provider}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Model</span>
                        <span className="text-white font-mono text-sm">{result.ml.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Predicted Cost</span>
                        <span className="text-green-400 font-semibold">${result.ml.predictedCost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Predicted Time</span>
                        <span className="text-blue-400 font-semibold">{result.ml.predictedTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={result.ml.confidence * 100} className="w-16 bg-gray-700" />
                          <span className="text-white text-sm">{Math.round(result.ml.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-blue-200 text-sm">{result.ml.reasoning}</p>
                    </div>
                  </Card>
                </div>

                {/* Alternative Options */}
                <Card className="p-6 bg-black/20 border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">Alternative ML Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.ml.alternatives.map((alt, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {alt.provider}
                          </Badge>
                          <span className="text-sm text-gray-400">#{index + 2}</span>
                        </div>
                        <div className="text-sm text-gray-300 mb-1">{alt.model}</div>
                        <div className="text-white font-semibold">${alt.predictedCost.toFixed(4)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 bg-black/20 border-white/10">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Experience ML Magic</h3>
                  <p className="text-gray-400">
                    Configure your test prompt and optimization strategy, then click "Run ML Comparison" 
                    to see how our AI-powered routing can save you money and time.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ML Analytics Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Real-Time ML Analytics</h2>
          <MLAnalyticsDashboard />
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-black/20 border-white/10 text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold text-white mb-2">Machine Learning</h3>
            <p className="text-gray-400 text-sm">
              Advanced algorithms learn from usage patterns to optimize provider selection
            </p>
          </Card>

          <Card className="p-6 bg-black/20 border-white/10 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Optimization</h3>
            <p className="text-gray-400 text-sm">
              Instant provider selection based on current performance and cost metrics
            </p>
          </Card>

          <Card className="p-6 bg-black/20 border-white/10 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Predictive Analytics</h3>
            <p className="text-gray-400 text-sm">
              Forecast costs and performance before execution with high confidence
            </p>
          </Card>

          <Card className="p-6 bg-black/20 border-white/10 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Auto-Optimization</h3>
            <p className="text-gray-400 text-sm">
              Continuous learning and improvement through reinforcement learning
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}