/**
 * Provider Performance Comparison Card Component
 * 
 * IMPLEMENTATION REASONING:
 * Visualizes performance metrics across AI providers for intelligent decision making.
 * Helps users understand which providers excel in speed, reliability, and cost efficiency.
 * Alternative simple table rejected because visual comparison is more actionable.
 * This assumes usage tracking data contains latency and success rate metrics.
 * If this breaks, check that provider performance data is properly calculated.
 * 
 * DEPENDENCIES:
 * - Requires useUsageAnalytics hook for provider performance data
 * - Assumes React environment with proper component lifecycle
 * - Performance: Lightweight calculations on cached localStorage data
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUsageAnalytics } from '@/lib/hooks/useUsageAnalytics';
import { 
  BarChart3, 
  Clock,
  CheckCircle,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle
} from 'lucide-react';

interface ProviderScore {
  provider: string;
  emoji: string;
  overallScore: number;
  metrics: {
    speed: { score: number; value: string; rank: number };
    reliability: { score: number; value: string; rank: number };
    costEfficiency: { score: number; value: string; rank: number };
    volume: { score: number; value: string; rank: number };
  };
  recommendation: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  strengths: string[];
  weaknesses: string[];
}

export function PerformanceComparisonCard() {
  const { stats, loading, error } = useUsageAnalytics(30);

  const getProviderEmoji = (provider: string): string => {
    const emojis: { [key: string]: string } = {
      'OPENAI': '🤖',
      'ANTHROPIC': '🔮',
      'GOOGLE': '🟡',
      'COHERE': '🟢',
      'HUGGING_FACE': '🤗',
      'OLLAMA': '🦙'
    };
    return emojis[provider] || '⚡';
  };

  const calculateProviderScores = (): ProviderScore[] => {
    if (!stats || stats.providerBreakdown.length === 0) return [];

    const providers = stats.providerBreakdown;
    
    // Calculate normalized scores (0-100)
    const maxLatency = Math.max(...providers.map(p => p.averageLatency));
    const minLatency = Math.min(...providers.map(p => p.averageLatency));
    const maxCostPerRequest = Math.max(...providers.map(p => p.cost / p.requests));
    const minCostPerRequest = Math.min(...providers.map(p => p.cost / p.requests));
    const maxRequests = Math.max(...providers.map(p => p.requests));

    const scores: ProviderScore[] = providers.map(provider => {
      // Speed score (lower latency = higher score)
      const speedScore = maxLatency === minLatency ? 100 : 
        Math.round(100 - ((provider.averageLatency - minLatency) / (maxLatency - minLatency)) * 100);
      
      // Reliability score (success rate)
      const reliabilityScore = Math.round(provider.successRate);
      
      // Cost efficiency score (lower cost per request = higher score)
      const costPerRequest = provider.cost / provider.requests;
      const costScore = maxCostPerRequest === minCostPerRequest ? 100 :
        Math.round(100 - ((costPerRequest - minCostPerRequest) / (maxCostPerRequest - minCostPerRequest)) * 100);
      
      // Volume score (more requests = higher score, max 100)
      const volumeScore = Math.min(100, Math.round((provider.requests / maxRequests) * 100));
      
      // Overall score (weighted average)
      const overallScore = Math.round(
        (speedScore * 0.3) + 
        (reliabilityScore * 0.3) + 
        (costScore * 0.25) + 
        (volumeScore * 0.15)
      );

      // Determine strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      if (speedScore >= 80) strengths.push('Fast response time');
      if (speedScore <= 40) weaknesses.push('Slow response time');
      
      if (reliabilityScore >= 90) strengths.push('High reliability');
      if (reliabilityScore <= 70) weaknesses.push('Reliability issues');
      
      if (costScore >= 80) strengths.push('Cost effective');
      if (costScore <= 40) weaknesses.push('Higher cost');
      
      if (volumeScore >= 60) strengths.push('High usage volume');

      // Recommendation based on overall score
      let recommendation: ProviderScore['recommendation'];
      if (overallScore >= 85) recommendation = 'excellent';
      else if (overallScore >= 70) recommendation = 'good';
      else if (overallScore >= 50) recommendation = 'fair';
      else recommendation = 'needs_improvement';

      return {
        provider: provider.provider,
        emoji: getProviderEmoji(provider.provider),
        overallScore,
        metrics: {
          speed: { 
            score: speedScore, 
            value: `${Math.round(provider.averageLatency)}ms`,
            rank: 0 // Will be filled after sorting
          },
          reliability: { 
            score: reliabilityScore, 
            value: `${Math.round(provider.successRate)}%`,
            rank: 0
          },
          costEfficiency: { 
            score: costScore, 
            value: `$${(provider.cost / provider.requests).toFixed(4)}`,
            rank: 0
          },
          volume: { 
            score: volumeScore, 
            value: `${provider.requests} requests`,
            rank: 0
          }
        },
        recommendation,
        strengths,
        weaknesses
      };
    });

    // Calculate ranks for each metric
    ['speed', 'reliability', 'costEfficiency', 'volume'].forEach(metric => {
      const sorted = [...scores].sort((a, b) => 
        b.metrics[metric as keyof typeof a.metrics].score - a.metrics[metric as keyof typeof a.metrics].score
      );
      
      sorted.forEach((provider, index) => {
        const originalProvider = scores.find(p => p.provider === provider.provider);
        if (originalProvider) {
          originalProvider.metrics[metric as keyof typeof originalProvider.metrics].rank = index + 1;
        }
      });
    });

    // Sort by overall score
    return scores.sort((a, b) => b.overallScore - a.overallScore);
  };

  const providerScores = calculateProviderScores();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Provider Performance
          </CardTitle>
          <CardDescription>Analyzing provider metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-400">Calculating performance scores...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats || providerScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Provider Performance
          </CardTitle>
          <CardDescription>Performance comparison unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Need multiple providers with usage data for performance comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestProvider = providerScores[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Provider Performance Comparison
          </div>
          <Badge variant="success" className="bg-blue-100 text-blue-800">
            <Target className="h-3 w-3 mr-1" />
            {bestProvider.emoji} {bestProvider.provider} leads
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time performance analysis across all your AI providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Performance Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Avg Latency</p>
            <p className="text-xs text-gray-600">
              {Math.round(stats.averageLatency)}ms
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Success Rate</p>
            <p className="text-xs text-gray-600">
              {Math.round(stats.successRate)}%
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Avg Cost/Req</p>
            <p className="text-xs text-gray-600">
              ${(stats.totalCost / stats.totalRequests).toFixed(4)}
            </p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Zap className="h-5 w-5 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Total Requests</p>
            <p className="text-xs text-gray-600">
              {stats.totalRequests}
            </p>
          </div>
        </div>

        {/* Provider Comparison Cards */}
        <div className="space-y-4">
          {providerScores.map((provider, index) => (
            <div key={provider.provider} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.emoji}</span>
                  <div>
                    <h3 className="font-medium">{provider.provider}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          provider.recommendation === 'excellent' ? 'success' :
                          provider.recommendation === 'good' ? 'outline' :
                          provider.recommendation === 'fair' ? 'warning' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {provider.recommendation.replace('_', ' ')}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="success" className="text-xs bg-gold-100 text-gold-800">
                          #1 Overall
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{provider.overallScore}</div>
                  <p className="text-xs text-gray-600">Overall Score</p>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Speed</span>
                    <span className="text-xs font-medium">#{provider.metrics.speed.rank}</span>
                  </div>
                  <Progress value={provider.metrics.speed.score} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{provider.metrics.speed.value}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Reliability</span>
                    <span className="text-xs font-medium">#{provider.metrics.reliability.rank}</span>
                  </div>
                  <Progress value={provider.metrics.reliability.score} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{provider.metrics.reliability.value}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Cost Efficiency</span>
                    <span className="text-xs font-medium">#{provider.metrics.costEfficiency.rank}</span>
                  </div>
                  <Progress value={provider.metrics.costEfficiency.score} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{provider.metrics.costEfficiency.value}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Volume</span>
                    <span className="text-xs font-medium">#{provider.metrics.volume.rank}</span>
                  </div>
                  <Progress value={provider.metrics.volume.score} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{provider.metrics.volume.value}</p>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="flex flex-wrap gap-2">
                {provider.strengths.map((strength, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {strength}
                  </Badge>
                ))}
                {provider.weaknesses.map((weakness, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-red-700 border-red-300 bg-red-50">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Performance Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">🏆 Best Overall: {bestProvider.emoji} {bestProvider.provider}</p>
              <p className="text-blue-700 text-xs mt-1">
                Score: {bestProvider.overallScore}/100 • {bestProvider.strengths.join(', ')}
              </p>
            </div>
            <div>
              <p className="font-medium text-purple-800">
                📊 Performance Spread: {Math.max(...providerScores.map(p => p.overallScore)) - Math.min(...providerScores.map(p => p.overallScore))} points
              </p>
              <p className="text-purple-700 text-xs mt-1">
                {providerScores.length} providers compared across 4 metrics
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}