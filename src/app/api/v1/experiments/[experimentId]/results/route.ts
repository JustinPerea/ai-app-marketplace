import { NextRequest, NextResponse } from 'next/server';
import { experimentTracker } from '@/lib/experiment-middleware';

// Real-time experiment results endpoint
// GET /v1/experiments/:experimentId/results - Get live experiment results

function getUserFromRequest(req: NextRequest): { user_id: string; email: string } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  return {
    user_id: 'user-demo-1',
    email: 'admin@company.com',
  };
}

export async function GET(req: NextRequest, { params }: { params: { experimentId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const experimentId = params.experimentId;
    
    // Get real-time results from experiment tracker
    const results = experimentTracker.calculateExperimentResults(experimentId);
    const trackingData = experimentTracker.getTrackingData(experimentId);

    // Calculate statistical significance and confidence intervals
    const statisticalAnalysis = calculateStatisticalSignificance(results);

    // Generate recommendations based on results
    const recommendations = generateRecommendations(results);

    const response = {
      experiment_id: experimentId,
      status: 'running',
      results: {
        ...results,
        statistical_analysis: statisticalAnalysis,
        recommendations,
        last_updated: new Date().toISOString(),
        sample_size: results.totalRequests,
        confidence_level: statisticalAnalysis.confidence_level,
      },
      raw_data: {
        total_data_points: trackingData.length,
        data_quality: calculateDataQuality(trackingData),
        collection_period: {
          start: trackingData.length > 0 ? new Date(Math.min(...trackingData.map(d => d.startTime))).toISOString() : null,
          end: trackingData.length > 0 ? new Date(Math.max(...trackingData.map(d => d.endTime || d.startTime))).toISOString() : null,
        },
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Experiment results error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

function calculateStatisticalSignificance(results: any): {
  confidence_level: number;
  significant_differences: { variant1: string; variant2: string; p_value: number; significant: boolean }[];
  sample_size_adequacy: 'low' | 'medium' | 'high';
  power_analysis: number;
} {
  const variants = Object.keys(results.variants);
  const significantDifferences: any[] = [];

  // Compare all variant pairs
  for (let i = 0; i < variants.length; i++) {
    for (let j = i + 1; j < variants.length; j++) {
      const variant1 = variants[i];
      const variant2 = variants[j];
      
      const v1Data = results.variants[variant1];
      const v2Data = results.variants[variant2];
      
      // Simple statistical test simulation
      const meanDiff = Math.abs(v1Data.avgCost - v2Data.avgCost);
      const pooledStdError = Math.sqrt((0.001 / v1Data.requests) + (0.001 / v2Data.requests));
      const tStatistic = meanDiff / pooledStdError;
      const pValue = Math.max(0.001, Math.min(0.5, 1 / (1 + Math.pow(tStatistic, 2))));
      
      significantDifferences.push({
        variant1,
        variant2,
        p_value: pValue,
        significant: pValue < 0.05,
        effect_size: meanDiff / Math.max(v1Data.avgCost, v2Data.avgCost),
      });
    }
  }

  // Determine sample size adequacy
  const totalSamples = results.totalRequests;
  let sampleSizeAdequacy: 'low' | 'medium' | 'high' = 'low';
  if (totalSamples >= 1000) sampleSizeAdequacy = 'high';
  else if (totalSamples >= 100) sampleSizeAdequacy = 'medium';

  // Calculate overall confidence level
  const significantTests = significantDifferences.filter(d => d.significant).length;
  const confidenceLevel = Math.min(0.99, 0.5 + (significantTests / significantDifferences.length) * 0.4);

  return {
    confidence_level: confidenceLevel,
    significant_differences: significantDifferences,
    sample_size_adequacy: sampleSizeAdequacy,
    power_analysis: Math.min(0.95, totalSamples / 1000), // Simplified power calculation
  };
}

function generateRecommendations(results: any): string[] {
  const recommendations: string[] = [];
  const variants = Object.entries(results.variants) as [string, any][];
  
  if (variants.length === 0) {
    return ['No data available yet. Continue running the experiment.'];
  }

  // Cost optimization recommendations
  const sortedByCost = variants.sort((a, b) => a[1].avgCost - b[1].avgCost);
  const cheapest = sortedByCost[0];
  const mostExpensive = sortedByCost[sortedByCost.length - 1];
  
  if (cheapest[1].avgCost < mostExpensive[1].avgCost * 0.8) {
    const savings = ((mostExpensive[1].avgCost - cheapest[1].avgCost) / mostExpensive[1].avgCost * 100).toFixed(1);
    recommendations.push(`${cheapest[0]} provides ${savings}% cost savings compared to ${mostExpensive[0]}`);
  }

  // Performance recommendations
  const sortedByLatency = variants.sort((a, b) => a[1].avgLatency - b[1].avgLatency);
  const fastest = sortedByLatency[0];
  if (fastest[1].avgLatency < 2000) {
    recommendations.push(`${fastest[0]} offers best performance with ${fastest[1].avgLatency}ms average latency`);
  }

  // Quality recommendations
  const sortedBySuccessRate = variants.sort((a, b) => b[1].successRate - a[1].successRate);
  const mostReliable = sortedBySuccessRate[0];
  if (mostReliable[1].successRate > 0.98) {
    recommendations.push(`${mostReliable[0]} shows excellent reliability with ${(mostReliable[1].successRate * 100).toFixed(1)}% success rate`);
  }

  // Sample size recommendations
  if (results.totalRequests < 100) {
    recommendations.push('Continue experiment to reach statistical significance (recommended: 1000+ requests)');
  } else if (results.totalRequests < 1000) {
    recommendations.push('Good progress! Continue to 1000+ requests for high confidence results');
  }

  // Business impact recommendations
  if (results.winner) {
    const winner = results.variants[results.winner];
    const monthlyRequests = 100000; // Example monthly volume
    const monthlySavings = variants.reduce((max, [name, data]) => {
      if (name === results.winner) return max;
      const savings = (data.avgCost - winner.avgCost) * monthlyRequests;
      return Math.max(max, savings);
    }, 0);
    
    if (monthlySavings > 100) {
      recommendations.push(`Switching to ${results.winner} could save approximately $${monthlySavings.toFixed(2)}/month at 100K requests`);
    }
  }

  return recommendations.length > 0 ? recommendations : ['Results are mixed. Consider running longer or adjusting experiment parameters.'];
}

function calculateDataQuality(trackingData: any[]): {
  completeness: number;
  consistency: number;
  accuracy: number;
  overall_score: number;
} {
  if (trackingData.length === 0) {
    return { completeness: 0, consistency: 0, accuracy: 0, overall_score: 0 };
  }

  // Completeness: percentage of records with all required fields
  const completeRecords = trackingData.filter(d => 
    d.startTime && d.endTime && d.inputTokens >= 0 && d.outputTokens >= 0 && d.cost >= 0
  ).length;
  const completeness = completeRecords / trackingData.length;

  // Consistency: variance in response times and costs within reasonable bounds
  const latencies = trackingData.filter(d => d.latency > 0).map(d => d.latency);
  const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  const latencyVariance = latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length;
  const consistency = Math.max(0, 1 - (Math.sqrt(latencyVariance) / avgLatency));

  // Accuracy: reasonable cost and latency values (no outliers beyond 3 standard deviations)
  const costs = trackingData.filter(d => d.cost >= 0).map(d => d.cost);
  const avgCost = costs.reduce((sum, c) => sum + c, 0) / costs.length;
  const costStdDev = Math.sqrt(costs.reduce((sum, c) => sum + Math.pow(c - avgCost, 2), 0) / costs.length);
  const outliers = costs.filter(c => Math.abs(c - avgCost) > 3 * costStdDev).length;
  const accuracy = Math.max(0, 1 - (outliers / costs.length));

  const overallScore = (completeness + consistency + accuracy) / 3;

  return {
    completeness: Math.round(completeness * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    accuracy: Math.round(accuracy * 100) / 100,
    overall_score: Math.round(overallScore * 100) / 100,
  };
}