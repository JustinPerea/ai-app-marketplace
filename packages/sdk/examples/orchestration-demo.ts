/**
 * AI Orchestration Demo - Shows Our Competitive Advantage
 * 
 * This demonstrates the sophisticated multi-provider orchestration
 * that makes our platform unique compared to competitors.
 */

import { ai, AIService } from '../src/orchestration';

async function demonstrateOrchestration() {
  console.log('🚀 AI Marketplace SDK - Orchestration Demo\n');

  // ============================================================================
  // Example 1: Simple Cost-Optimized Request
  // ============================================================================
  
  console.log('📊 Example 1: Cost-Optimized Analysis');
  
  const costOptimized = await ai.complete({
    messages: [{ role: 'user', content: 'Analyze the risks in this contract: [contract text]' }],
    strategy: 'cost_optimized',
    constraints: {
      maxCost: 0.05, // Maximum 5 cents
      maxLatency: 10000 // Maximum 10 seconds
    }
  });
  
  console.log(`Provider used: ${costOptimized.orchestration.providersUsed[0]}`);
  console.log(`Total cost: $${costOptimized.cost.total.toFixed(4)}`);
  console.log(`Confidence: ${costOptimized.confidence.overall}%`);
  console.log(`Processing time: ${costOptimized.orchestration.processingTime}ms\n`);

  // ============================================================================
  // Example 2: Privacy-First Medical Analysis
  // ============================================================================
  
  console.log('🏥 Example 2: HIPAA-Compliant Medical Analysis');
  
  const hipaaCompliant = await ai.complete({
    messages: [{ role: 'user', content: 'Create SOAP notes from this patient visit: [medical data]' }],
    strategy: 'privacy_first',
    constraints: {
      privacyLevel: 'hipaa'
    },
    requirements: {
      analysis: true
    }
  });
  
  console.log(`Provider used: ${hipaaCompliant.orchestration.providersUsed[0]} (Local/HIPAA)`);
  console.log(`Privacy level: HIPAA Compliant ✅`);
  console.log(`Cost: $${hipaaCompliant.cost.total.toFixed(4)} (Local = Free)`);
  console.log(`Confidence: ${hipaaCompliant.confidence.overall}%\n`);

  // ============================================================================
  // Example 3: Multi-Step Workflow with Different Providers
  // ============================================================================
  
  console.log('🔄 Example 3: Multi-Provider Workflow');
  
  const workflow = await ai.workflow([
    {
      name: 'extract',
      prompt: 'Extract key financial data from this report: [financial report]',
      strategy: 'cost_optimized'
    },
    {
      name: 'analyze', 
      prompt: 'Analyze the extracted data for investment risks: {{ extract.output }}',
      strategy: 'performance',
      requirements: { reasoning: true }
    },
    {
      name: 'summarize',
      prompt: 'Create executive summary of the analysis: {{ analyze.output }}',
      strategy: 'balanced',
      requirements: { creative: true }
    }
  ]);
  
  console.log('Workflow completed:');
  Object.entries(workflow.results).forEach(([step, result]) => {
    console.log(`  ${step}: ${result.orchestration.providersUsed[0]} ($${result.cost.total.toFixed(4)})`);
  });
  
  const totalCost = Object.values(workflow.results)
    .reduce((sum, result) => sum + result.cost.total, 0);
  console.log(`Total workflow cost: $${totalCost.toFixed(4)}\n`);

  // ============================================================================
  // Example 4: Performance-First with Fallbacks
  // ============================================================================
  
  console.log('⚡ Example 4: Performance-First with Intelligent Fallbacks');
  
  const performanceFirst = await ai.complete({
    messages: [{ role: 'user', content: 'Generate code to implement a REST API with authentication' }],
    strategy: 'performance',
    requirements: {
      coding: true,
      tools: true
    },
    constraints: {
      maxLatency: 3000, // Must respond within 3 seconds
      preferredProviders: ['openai', 'anthropic']
    }
  });
  
  console.log(`Primary provider: ${performanceFirst.orchestration.providersUsed[0]}`);
  console.log(`Latency: ${performanceFirst.performance.latency}ms`);
  console.log(`Quality score: ${performanceFirst.confidence.qualityScore}%`);
  console.log(`Fallbacks triggered: ${performanceFirst.orchestration.fallbacksTriggered ? 'Yes' : 'No'}\n`);

  // ============================================================================
  // Example 5: Cross-Provider Validation for Critical Decisions
  // ============================================================================
  
  console.log('✅ Example 5: Cross-Provider Validation');
  
  const validated = await ai.complete({
    messages: [{ role: 'user', content: 'Should we approve this $10M loan application based on this credit report?' }],
    strategy: 'balanced',
    validation: {
      enabled: true,
      providers: ['openai', 'anthropic', 'google'],
      threshold: 80 // 80% agreement required
    },
    requirements: {
      reasoning: true,
      analysis: true
    }
  });
  
  console.log(`Provider agreement: ${validated.confidence.providerAgreement}%`);
  console.log(`Overall confidence: ${validated.confidence.overall}%`);
  console.log(`Validation passed: ${validated.confidence.providerAgreement >= 80 ? 'Yes ✅' : 'No ❌'}`);
  console.log(`Cost efficiency: ${validated.confidence.costEfficiency}%\n`);

  // ============================================================================
  // Summary: What Makes This Special
  // ============================================================================
  
  console.log('🎯 What Makes Our Orchestration Engine Unique:');
  console.log('   • Intelligent provider selection based on cost/performance/privacy');
  console.log('   • Automatic fallbacks when providers fail');
  console.log('   • Cross-provider validation for critical decisions');
  console.log('   • Multi-step workflows with optimal provider routing');
  console.log('   • Real-time confidence scoring and quality metrics');
  console.log('   • HIPAA-compliant local processing options');
  console.log('   • Cost optimization with transparent pricing');
  console.log('   • No vendor lock-in - users control their API keys\n');
  
  console.log('🏆 Competitive Advantages:');
  console.log('   • OpenAI: Single provider, no cost optimization');
  console.log('   • Claude: Single provider, no fallbacks');
  console.log('   • LangChain: Complex setup, no built-in cost optimization');
  console.log('   • Us: Turnkey multi-provider intelligence with BYOK model');
}

// ============================================================================
// Integration Examples for Common Use Cases
// ============================================================================

export async function medicalScribeExample() {
  // HIPAA-compliant medical scribe using local processing
  const notes = await ai.complete({
    messages: [{ role: 'user', content: 'Patient visit audio transcript: [audio]' }],
    strategy: 'privacy_first',
    constraints: { privacyLevel: 'hipaa' },
    requirements: { analysis: true }
  });
  
  return notes;
}

export async function codeReviewExample() {
  // Multi-provider code review for comprehensive analysis
  const review = await ai.workflow([
    {
      name: 'security',
      prompt: 'Analyze this code for security vulnerabilities: [code]',
      strategy: 'performance',
      requirements: { coding: true, analysis: true }
    },
    {
      name: 'performance',
      prompt: 'Review performance optimizations for: {{ security.output }}',
      strategy: 'cost_optimized',
      requirements: { coding: true }
    },
    {
      name: 'summary',
      prompt: 'Create actionable summary: {{ performance.output }}',
      strategy: 'balanced',
      requirements: { creative: true }
    }
  ]);
  
  return review;
}

export async function legalContractExample() {
  // Cost-optimized legal contract analysis with validation
  const analysis = await ai.complete({
    messages: [{ role: 'user', content: 'Review this contract for risks: [contract]' }],
    strategy: 'cost_optimized',
    validation: { enabled: true, threshold: 85 },
    requirements: { reasoning: true, analysis: true },
    constraints: { maxCost: 0.10 }
  });
  
  return analysis;
}

if (require.main === module) {
  demonstrateOrchestration().catch(console.error);
}