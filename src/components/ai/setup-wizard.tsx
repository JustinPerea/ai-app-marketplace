'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info, Cpu, HardDrive, Zap } from 'lucide-react';

interface SystemInfo {
  totalRAM: number;
  availableRAM: number;
  cpuCores: number;
  platform: string;
  architecture: string;
  hasGPU: boolean;
  recommendedModel: string;
  optimizationLevel: 'minimal' | 'balanced' | 'performance';
}

interface ModelRecommendations {
  recommended: string;
  compatible: string[];
  warnings: { [key: string]: string[] };
  systemInfo: SystemInfo;
}

export function OllamaSetupWizard() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ModelRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'analysis' | 'recommendations' | 'setup'>('analysis');

  useEffect(() => {
    analyzeSystem();
  }, []);

  const analyzeSystem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/system-info');
      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.data);
        setStep('recommendations');
      } else {
        setError(result.error || 'Failed to analyze system');
        if (result.fallback) {
          setRecommendations({
            ...result.fallback,
            systemInfo: {
              totalRAM: 8,
              availableRAM: 4,
              cpuCores: 4,
              platform: 'unknown',
              architecture: 'unknown',
              hasGPU: false,
              recommendedModel: 'ollama-llama32',
              optimizationLevel: 'balanced'
            }
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getOptimizationBadge = (level: string) => {
    switch (level) {
      case 'performance':
        return <Badge className="bg-green-100 text-green-800">High Performance</Badge>;
      case 'balanced':
        return <Badge className="bg-blue-100 text-blue-800">Balanced</Badge>;
      case 'minimal':
        return <Badge className="bg-yellow-100 text-yellow-800">Conservative</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPerformanceIcon = (level: string) => {
    switch (level) {
      case 'performance':
        return <Zap className="h-4 w-4 text-green-600" />;
      case 'balanced':
        return <Cpu className="h-4 w-4 text-blue-600" />;
      case 'minimal':
        return <HardDrive className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Your System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Detecting hardware capabilities for optimal AI performance...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !recommendations) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            System Analysis Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={analyzeSystem} variant="outline">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Memory</span>
              </div>
              <p className="text-sm text-gray-600">
                {recommendations.systemInfo.availableRAM}GB Available / {recommendations.systemInfo.totalRAM}GB Total
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-gray-600" />
                <span className="font-medium">CPU</span>
              </div>
              <p className="text-sm text-gray-600">
                {recommendations.systemInfo.cpuCores} Cores
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getPerformanceIcon(recommendations.systemInfo.optimizationLevel)}
                <span className="font-medium">Optimization</span>
              </div>
              {getOptimizationBadge(recommendations.systemInfo.optimizationLevel)}
            </div>
          </div>
          
          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error} - Using fallback configuration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Model Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended AI Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Recommended Model */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-green-800">Recommended Model</h3>
                <Badge className="bg-green-100 text-green-800">Best Match</Badge>
              </div>
              <p className="text-sm text-green-700 mb-3">
                {recommendations.recommended.replace('ollama-', '').replace('32', '3.2').replace('33', '3.3')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-medium">Performance:</span>
                  <span className="ml-1">
                    {recommendations.systemInfo.optimizationLevel === 'performance' && '🚀 Excellent'}
                    {recommendations.systemInfo.optimizationLevel === 'balanced' && '⚡ Good'}
                    {recommendations.systemInfo.optimizationLevel === 'minimal' && '🔋 Conservative'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Context:</span>
                  <span className="ml-1">4096 tokens (optimized)</span>
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span>
                  <span className="ml-1">15-30 seconds</span>
                </div>
              </div>
            </div>

            {/* Compatible Models */}
            <div>
              <h3 className="font-medium mb-3">All Compatible Models</h3>
              <div className="space-y-2">
                {recommendations.compatible.map((model) => {
                  const isRecommended = model === recommendations.recommended;
                  const warnings = recommendations.warnings[model] || [];
                  
                  return (
                    <div
                      key={model}
                      className={`p-3 border rounded-lg ${
                        isRecommended 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {model.replace('ollama-', '').replace('32', '3.2').replace('33', '3.3')}
                        </span>
                        {isRecommended && (
                          <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                        )}
                      </div>
                      
                      {warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {warnings.map((warning, index) => (
                            <p key={index} className="text-xs text-yellow-700 flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optimization Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Optimization Applied:</strong> This configuration uses hardware-specific tuning 
                including 80% speed improvement through context window optimization (num_ctx: 4096) 
                and adaptive resource allocation based on your system capabilities.
              </AlertDescription>
            </Alert>

          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Install Ollama</p>
                  <p className="text-sm text-gray-600">Download from ollama.ai or use: <code className="bg-gray-100 px-1 rounded">curl -fsSL https://ollama.ai/install.sh | sh</code></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Install Recommended Model</p>
                  <p className="text-sm text-gray-600">
                    Run: <code className="bg-gray-100 px-1 rounded">
                      ollama pull {recommendations.recommended.replace('ollama-', '')}
                    </code>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Start Processing</p>
                  <p className="text-sm text-gray-600">Your system is automatically optimized - just upload a PDF and start generating notes!</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.open('/marketplace/apps/pdf-notes-generator', '_blank')}
              className="w-full"
            >
              Test PDF Notes Generator
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}