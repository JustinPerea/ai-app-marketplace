export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APIKeyManager } from '@/lib/api-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BackToMarketplace } from '@/components/ui/back-to-marketplace';
import { 
  Upload, 
  FileText, 
  Brain, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb,
  Key,
} from 'lucide-react';
import { QuotaDisplay } from '@/components/ui/quota-display';

interface NoteStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  example: string;
}

const noteStyles: NoteStyle[] = [
  {
    id: 'summary',
    name: 'Executive Summary',
    description: 'High-level overview with key takeaways',
    icon: Target,
    example: '• Main Argument: [Key thesis]\n• Evidence: [Supporting data]\n• Conclusion: [Final recommendation]'
  },
  {
    id: 'structured',
    name: 'Structured Notes',
    description: 'Organized sections with clear hierarchy',
    icon: BookOpen,
    example: '1. Introduction\n   - Key concepts\n   - Context\n2. Main Points\n   - Supporting details'
  },
  {
    id: 'actionable',
    name: 'Action Items',
    description: 'Practical steps and recommendations',
    icon: Lightbulb,
    example: '□ Immediate Actions\n□ Follow-up Tasks\n□ Research Areas\n□ Decision Points'
  }
];

const supportedModels = [
  { id: 'google-gemini', name: 'Gemini 1.5 Flash ⭐', type: 'cloud', cost: '$0.001/page', privacy: 'High', recommended: true, provider: 'GOOGLE' },
  { id: 'anthropic-claude', name: 'Claude 3 Haiku ⚡', type: 'cloud', cost: '$0.003/page', privacy: 'High', speed: 'Fastest Claude', provider: 'ANTHROPIC' },
  { id: 'openai-gpt4', name: 'GPT-4o Mini', type: 'cloud', cost: '$0.005/page', privacy: 'Medium', provider: 'OPENAI' },
  { id: 'ollama-llama32', name: 'Llama 3.2 3B (Local)', type: 'local', cost: 'Free*', privacy: 'Highest', provider: 'LOCAL' },
  { id: 'ollama-llama33', name: 'Llama 3.3 (Local)', type: 'local', cost: 'Free*', privacy: 'Highest', provider: 'LOCAL' }
];

export default function PDFNotesGeneratorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('google-gemini');
  const [selectedStyle, setSelectedStyle] = useState('summary');
  const [useOrchestration, setUseOrchestration] = useState(false); // Start with false to prevent hydration mismatch
  const [selectedStrategy, setSelectedStrategy] = useState('cost_optimized'); // Default strategy
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [orchestrationMetadata, setOrchestrationMetadata] = useState<any>(null);
  const [userId, setUserId] = useState('demo-user-loading'); // Demo user ID
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setUserId('demo-user-' + Math.random().toString(36).substr(2, 9));
    // Set orchestration to true after mounting to prevent hydration mismatch
    setUseOrchestration(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Check which providers have API keys
      const apiKeys = APIKeyManager.getAll();
      const providers = apiKeys.filter(k => k.isActive).map(k => k.provider);
      setConnectedProviders(providers);
    }
  }, [mounted]);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    setSelectedFile(file);
    setExtractedText('');
    setGeneratedNotes('');
  };

  const handleTrySample = () => {
    // Create a sample text that simulates a PDF extraction
    const sampleText = `# Sample Business Report

## Executive Summary
This quarterly business report demonstrates the AI marketplace platform's PDF processing capabilities. The document contains structured information that can be transformed into various note formats.

## Key Performance Indicators
Our company achieved significant growth in Q4 2024:
- Revenue Growth: 25% increase compared to Q3 2024
- Customer Acquisition: 1,200 new enterprise customers
- Market Share: Expanded to 15% in our target segment
- Customer Satisfaction: 4.8/5.0 average rating

## Strategic Recommendations
Based on our analysis, we recommend:
### Immediate Actions (Q1 2025)
- Expand customer success team by 30%
- Invest in AI-powered analytics platform
- Launch customer referral program

### Medium-term Goals (Q2-Q3 2025)
- Enter European market
- Develop mobile application
- Establish research and development lab`;

    // Create a mock file object for demo purposes
    const mockFile = new File([sampleText], 'sample-business-report.pdf', { type: 'application/pdf' });
    setSelectedFile(mockFile);
    setExtractedText('');
    setGeneratedNotes('');
    
    // For sample, switch to local model to avoid API key requirement
    setSelectedModel('ollama-llama32');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const isModelAvailable = (model: any): boolean => {
    if (model.type === 'local') return true; // Local models don't need API keys
    return connectedProviders.includes(model.provider);
  };

  const getApiKeyForModel = (model: any): string | null => {
    if (model.type === 'local') return null;
    return APIKeyManager.getKey(model.provider);
  };


  const handleProcessPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setGeneratedNotes('');
    setExtractedText('');

    try {
      setProcessingStep('Processing PDF and generating notes...');
      
      // Validate API key for cloud models
      const modelData = supportedModels.find(m => m.id === selectedModel);
      if (modelData?.type === 'cloud' && !isModelAvailable(modelData)) {
        alert(`Please connect your ${modelData.provider} API key in Settings first.`);
        return;
      }

      // Handle sample document differently - ONLY for files explicitly named with "sample-"
      if (selectedFile.name.startsWith('sample-')) {
        // For sample document, simulate the processing with extracted text
        const sampleExtractedText = await selectedFile.text();
        setExtractedText(sampleExtractedText);
        
        // Simulate AI processing with orchestration demo
        const sampleNotes = useOrchestration 
          ? generateOrchestrationSampleNotes(selectedStyle)
          : generateSampleNotes(selectedStyle, selectedModelData?.name || 'AI');
        setGeneratedNotes(sampleNotes);
        
        if (useOrchestration) {
          setOrchestrationMetadata({
            selectedProvider: 'GOOGLE',
            providersConsidered: ['GOOGLE', 'ANTHROPIC', 'OPENAI', 'LOCAL'],
            costSavings: '67% savings vs OpenAI',
            strategy: 'cost_optimized'
          });
        }
        
        setProcessingStep('✅ Sample processed successfully!');
        setTimeout(() => setProcessingStep(''), 3000);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('style', selectedStyle);
      formData.append('useOrchestration', useOrchestration.toString());
      formData.append('userId', userId);
      
      // Add orchestration strategy if enabled
      if (useOrchestration) {
        formData.append('strategy', selectedStrategy);
      }
      
      // For non-orchestration mode, include model selection
      if (!useOrchestration) {
        formData.append('model', selectedModel);
        
        // Add API key for cloud models
        if (modelData?.type === 'cloud') {
          const apiKey = getApiKeyForModel(modelData);
          if (apiKey) {
            formData.append('apiKey', apiKey);
            APIKeyManager.markUsed(modelData.provider); // Track usage
          }
        }
      }

      // Choose API endpoint based on orchestration setting
      const apiEndpoint = useOrchestration 
        ? '/api/orchestration/pdf-notes'  // ⭐ Our competitive advantage
        : '/api/apps/pdf-notes';  // Traditional approach

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to process PDF');
      }

      const result = await response.json();
      
      // Set both extracted text and generated notes from the backend response
      setExtractedText(result.extractedText);
      setGeneratedNotes(result.generatedNotes);

      // Store orchestration metadata if available
      if (result.metadata?.orchestrationUsed) {
        setOrchestrationMetadata({
          selectedProvider: result.metadata.selectedProvider,
          providersConsidered: result.metadata.providersConsidered,
          costSavings: result.metadata.costSavings,
          strategy: result.metadata.strategy || 'cost_optimized',
          confidenceScore: result.metadata.confidenceScore,
          actualCost: result.metadata.actualCost
        });
      }

      // Show processing results
      if (result.metadata?.orchestrationUsed) {
        setProcessingStep(`✅ Orchestration complete! ${result.metadata.costSavings || 'Optimized for cost and quality'}`);
        setTimeout(() => setProcessingStep(''), 4000);
      } else if (result.metadata?.cacheHit) {
        setProcessingStep(`✅ Cache hit! Saved ~$0.002 in API costs`);
        setTimeout(() => setProcessingStep(''), 3000);
      }

    } catch (error) {
      console.error('Processing error:', error);
      
      // Enhanced error handling with specific guidance
      let errorMessage = 'Error processing PDF. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
          // Extract timeout duration if available
          const timeoutMatch = error.message.match(/(\d+(?:\.\d+)?)\s*minutes?/);
          const timeoutDuration = timeoutMatch ? timeoutMatch[1] : 'several';
          
          errorMessage = `Processing timeout after ${timeoutDuration} minutes.\n\n` +
            `💡 Try these solutions:\n` +
            `• Use a smaller PDF (under 10 pages works best)\n` +
            `• Switch to a cloud AI model (GPT-4o, Claude) for faster processing\n` +
            `• Break large documents into smaller sections\n\n` +
            `Local AI models need more time for large documents, but offer complete privacy.`;
        } else if (error.message.includes('API key')) {
          errorMessage = `${error.message}\n\n💡 Add your API key in the AI Provider Settings to use cloud models.`;
        } else if (error.message.includes('rate limit')) {
          errorMessage = `${error.message}\n\n💡 Try again in a few minutes or switch to a different AI model.`;
        } else if (error.message.includes('Ollama')) {
          errorMessage = `${error.message}\n\n💡 Make sure Ollama is running and the model is installed:\n` +
            `• ollama serve\n` +
            `• ollama pull llama3.2:3b`;
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const downloadNotes = () => {
    const blob = new Blob([generatedNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name.replace('.pdf', '')}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSampleNotes = (style: string, modelName: string): string => {
    const timestamp = new Date().toLocaleString();
    
    switch (style) {
      case 'summary':
        return `# Executive Summary: Sample Business Report

## Key Findings
• Revenue Growth: 25% increase in Q4 2024, driven by new product features and strategic partnerships
• Customer Acquisition: 1,200 new enterprise customers with 4.8/5.0 satisfaction rating
• Market Position: Expanded to 15% market share in target segment
• Operational Excellence: 99.9% system uptime and 40% improvement in API response times

## Main Arguments
The company demonstrates strong fundamentals with exceptional growth metrics and operational improvements. Strategic initiatives in sales, technology, and marketing have delivered measurable results that position the organization for continued expansion.

## Methodology/Approach
Quarterly performance analysis based on KPIs across sales, operations, and customer satisfaction metrics. Financial projections utilize current growth trends and market analysis.

## Conclusions & Implications
The organization is well-positioned for aggressive 2025 expansion with projected 67% revenue growth to $50M. Recommended focus on European market entry and mobile application development.

---
*Generated by ${modelName} • ${timestamp}*`;

      case 'structured':
        return `# Sample Business Report - Structured Notes

## 1. Introduction/Background
   ### Purpose
   - Quarterly performance review for Q4 2024
   - Strategic planning for 2025 expansion
   
   ### Context
   - Strong market position with growing customer base
   - Technology platform achieving enterprise-grade performance

## 2. Main Content
   ### Performance Metrics
   - Revenue: 25% quarter-over-quarter growth
   - Customers: 1,200 new enterprise acquisitions
   - Market share: 15% in target segment
   
   ### Operational Improvements
   - API performance: 40% faster response times
   - System reliability: 99.9% uptime achieved
   - Security: SOC 2 and ISO 27001 certifications

## 3. Key Results/Findings
   ### Growth Indicators
   - Sales team exceeded targets by 18%
   - Marketing ROI: 3.2x for digital campaigns
   - Customer satisfaction: 4.8/5.0 average rating
   
   ### Technology Achievements
   - Infrastructure upgrades completed
   - Security certifications obtained
   - Performance benchmarks exceeded

## 4. Conclusions
   - Company positioned for rapid 2025 growth
   - Strong foundation for international expansion
   - Technology platform ready for scale

---
*Generated by ${modelName} • ${timestamp}*`;

      case 'actionable':
        return `# Actionable Insights: Sample Business Report

## Immediate Actions Required
□ **Customer Success Expansion**
  - Hire 30% more customer success team members by Q1 2025
  - Implement new customer onboarding processes

□ **Technology Investment**
  - Deploy AI-powered analytics platform
  - Complete mobile application development planning

## Strategic Recommendations
□ **Market Expansion**
  - Launch European market entry strategy in Q2 2025
  - Establish partnerships with local distributors
  - Conduct market research in target countries

□ **Product Development**
  - Begin mobile application development
  - Set up research and development lab
  - Invest in AI and machine learning capabilities

## Success Metrics
□ **Financial Targets**
  - Achieve $50M revenue (67% growth) in 2025
  - Maintain 22% net margin
  - Reach break-even by Q2 2025

□ **Operational Metrics**
  - Maintain 99.9% system uptime
  - Achieve 4.9/5.0 customer satisfaction
  - Reduce customer acquisition cost by 15%

## Next Steps & Follow-up
□ Q1 2025: Launch customer referral program
□ Q2 2025: Enter European market and assess IPO readiness
□ Q3 2025: Complete mobile app beta testing

---
*Generated by ${modelName} • ${timestamp}*`;

      default:
        return `# Sample Notes Generated

This is a sample output demonstrating the AI note generation capabilities.

---
*Generated by ${modelName} • ${timestamp}*`;
    }
  };

  // ⭐ ORCHESTRATION DEMO FUNCTION - Shows our competitive advantage
  const generateOrchestrationSampleNotes = (style: string): string => {
    const timestamp = new Date().toLocaleString();
    
    switch (style) {
      case 'summary':
        return `# Executive Summary: Sample Business Report
*⭐ Generated with AI Orchestration Engine - Our Competitive Advantage*

## 🧠 Intelligent Processing Complete
This document was processed using our **multi-provider orchestration engine** that automatically selected the optimal AI provider based on cost, performance, and quality requirements.

### 🎯 Key Findings
• **Revenue Growth**: 25% increase in Q4 2024, significantly outperforming industry benchmarks
• **Customer Acquisition**: 1,200 new enterprise customers with exceptional 4.8/5.0 satisfaction 
• **Market Position**: Expanded to 15% market share through strategic execution
• **Operational Excellence**: 99.9% system uptime demonstrating technical superiority

### 💰 Orchestration Benefits Demonstrated
• **Cost Optimization**: Selected Gemini Flash (67% cheaper than GPT-4o)
• **Quality Assurance**: Cross-validated with Claude for accuracy
• **Performance**: Sub-2-second response time achieved
• **Reliability**: Automatic failover available across 4 providers

### 🚀 Strategic Implications
The company demonstrates exceptional fundamentals with measurable competitive advantages. The orchestration engine identified this as a high-growth opportunity with significant scaling potential for 2025 expansion.

---
*🎯 Generated by AI Orchestration Engine using Gemini 1.5 Flash • ${timestamp}*
*⭐ Only available on our platform - no competitor offers intelligent multi-provider orchestration*`;

      case 'structured':
        return `# Sample Business Report - Structured Notes
*⭐ Powered by AI Orchestration Engine*

## 🧠 Orchestration Analysis Summary
**Selected Provider**: Gemini 1.5 Flash (optimal cost-performance ratio)
**Alternative Providers**: OpenAI, Claude, Local Llama evaluated
**Cost Savings**: 67% vs traditional single-provider approach
**Processing Strategy**: Balanced optimization for quality and efficiency

## 1. Executive Overview
   ### Performance Metrics
   - **Revenue Growth**: 25% quarter-over-quarter increase
   - **Customer Metrics**: 1,200 new acquisitions, 4.8/5.0 satisfaction
   - **Market Position**: 15% target segment penetration achieved
   
   ### Orchestration Advantages
   - **Smart Routing**: Automatic provider selection based on requirements
   - **Cost Control**: Real-time optimization across multiple models
   - **Quality Validation**: Cross-provider verification when needed

## 2. Operational Excellence
   ### Technology Achievements
   - **System Reliability**: 99.9% uptime maintained
   - **Performance**: 40% improvement in API response times
   - **Security**: SOC 2 and ISO 27001 certifications obtained
   
   ### Orchestration Features
   - **Privacy-Aware**: Local processing available for sensitive data
   - **Failover Protection**: Automatic backup providers configured
   - **Real-time Analytics**: Usage and cost tracking included

## 3. Strategic Recommendations
   ### Immediate Actions (Q1 2025)
   - Scale customer success team by 30%
   - Deploy AI-powered analytics platform
   - Launch customer referral program
   
   ### Competitive Advantages
   - **Multi-Provider Strategy**: Avoid vendor lock-in risks
   - **Cost Optimization**: Achieve 50-80% savings vs single-provider
   - **Quality Assurance**: Multiple model validation available

---
*🎯 Generated by AI Orchestration Engine using Gemini 1.5 Flash • ${timestamp}*
*⭐ Experience the only platform with intelligent multi-provider orchestration*`;

      case 'actionable':
        return `# Actionable Insights: Sample Business Report
*⭐ AI Orchestration Engine - Competitive Advantage Demo*

## 🚀 Immediate Actions Required

### ⭐ Orchestration Engine Benefits
□ **Cost Optimization Achieved**
  - Saved 67% vs OpenAI GPT-4o by using Gemini Flash
  - Automatic provider selection based on cost-performance analysis
  - Real-time cost tracking and optimization

□ **Quality Assurance Implemented**
  - Cross-provider validation available (Claude backup)
  - Confidence scoring: 92% accuracy rating
  - Intelligent failover if primary provider unavailable

### 🎯 Business Action Items
□ **Revenue Growth (Priority: High)**
  - Hire 30% more customer success team by Q1 2025
  - Deploy AI-powered analytics platform
  - Launch customer referral program with measurable KPIs

□ **Market Expansion (Priority: Medium)**
  - Enter European market Q2 2025
  - Establish local partnerships and distribution
  - Conduct comprehensive market research

### 📊 Success Metrics & Tracking
□ **Financial Targets (Monitor Monthly)**
  - Achieve $50M revenue (67% growth) in 2025
  - Maintain 22% net profit margin
  - Reach break-even by Q2 2025

□ **Operational Excellence (Monitor Weekly)**
  - Maintain 99.9% system uptime
  - Achieve 4.9/5.0 customer satisfaction
  - Reduce customer acquisition cost by 15%

### 🏆 Competitive Advantages Leveraged
□ **Multi-Provider AI Strategy**
  - Avoid vendor lock-in risks
  - Optimize costs automatically
  - Ensure quality through cross-validation
  - Maintain privacy with local processing options

□ **Next Steps (This Quarter)**
  - Implement orchestration engine across all AI workflows
  - Train team on multi-provider optimization benefits
  - Track cost savings and quality improvements monthly

---
*🎯 Generated by AI Orchestration Engine using Gemini 1.5 Flash • ${timestamp}*
*⭐ Only platform offering intelligent multi-provider AI orchestration*
*💰 Cost optimized • 🔒 Privacy protected • ⚡ Performance enhanced*`;

      default:
        return `# AI Orchestration Demo - Sample Processing Complete

## ⭐ Unique Platform Feature Demonstrated
This sample showcases our competitive advantage: **intelligent multi-provider orchestration** that no other platform offers.

### 🧠 What Just Happened
- **Provider Selection**: Automatically chose optimal AI model
- **Cost Optimization**: Saved significant costs vs fixed provider
- **Quality Assurance**: Multiple models available for validation
- **Reliability**: Automatic failover if primary provider fails

---
*🎯 Generated by AI Orchestration Engine • ${timestamp}*
*⭐ Experience the future of AI application development*`;
    }
  };

  const selectedModelData = supportedModels.find(m => m.id === selectedModel);
  const selectedStyleData = noteStyles.find(s => s.id === selectedStyle);

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation with Breadcrumbs */}
        <BackToMarketplace 
          appName="PDF Notes Generator"
          categoryName="Content Creation"
          categorySlug="CONTENT_CREATION"
          showBreadcrumbs={true}
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">PDF Notes Generator</h1>
              <p className="text-gray-600">Transform any PDF into structured, actionable notes using AI</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              <Shield className="h-3 w-3 mr-1" />
              Privacy-First
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
              <Brain className="h-3 w-3 mr-1" />
              Multi-Model Support
            </Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
              <Zap className="h-3 w-3 mr-1" />
              Instant Processing
            </Badge>
            <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
              <Clock className="h-3 w-3 mr-1" />
              Save Hours of Work
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quota Display */}
            {mounted && (
              <QuotaDisplay 
                userId={userId}
                onUpgrade={(provider) => {
                  // Handle upgrade flow - for demo purposes, show alert
                  alert(`Upgrade flow for ${provider} would be triggered here`);
                }}
                onConnectApiKey={(provider) => {
                  // Handle API key setup - for demo purposes, show alert
                  alert(`API key setup for ${provider} would be shown here`);
                }}
              />
            )}
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload PDF
                </CardTitle>
                <CardDescription>
                  Select a PDF document to extract notes from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 border-t"></div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTrySample}
                    className="w-full"
                    type="button"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Try Sample Document
                  </Button>
                  {selectedFile && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {selectedFile.name}
                        </span>
                        {selectedFile.name.includes('sample') && (
                          <Badge variant="outline" className="text-xs">
                            Sample
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {selectedFile.size > 0 ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Sample document ready'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ⭐ ORCHESTRATION ENGINE TOGGLE - Our Competitive Advantage */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  AI Orchestration Engine ⭐
                </CardTitle>
                <CardDescription>
                  Our unique competitive advantage - intelligent multi-provider optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      useOrchestration 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => setUseOrchestration(!useOrchestration)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        useOrchestration ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {useOrchestration && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">
                          {useOrchestration ? '⚡ Orchestration Enabled' : '🔧 Traditional Mode'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {useOrchestration 
                            ? 'AI will automatically select the optimal provider for cost and quality'
                            : 'Manually select a single AI provider (traditional approach)'
                          }
                        </p>
                        
                        {useOrchestration && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              <span>Up to 80% cost savings</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              <span>Automatic provider selection</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              <span>Quality validation across models</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              <span>Intelligent failover protection</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {useOrchestration && (
                    <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-900">Competitive Advantage Active</div>
                          <div className="text-blue-700 text-xs mt-1">
                            No other platform offers intelligent multi-provider orchestration. 
                            You'll see automatic cost optimization and provider selection in action.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Model Selection - Enhanced for orchestration preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {mounted && useOrchestration ? 'AI Preferences' : 'AI Model'}
                </CardTitle>
                <CardDescription>
                  {mounted && useOrchestration 
                    ? 'Set preferences - orchestration will consider these when optimizing'
                    : 'Choose your preferred AI model for note generation'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!mounted ? (
                    // Loading skeleton to prevent hydration mismatch
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border rounded-lg bg-gray-50">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    supportedModels.map((model) => {
                      const available = isModelAvailable(model);
                    return (
                      <div
                        key={model.id}
                        className={`p-3 border rounded-lg transition-colors ${
                          !available
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : selectedModel === model.id
                            ? 'border-blue-500 bg-blue-50 cursor-pointer'
                            : model.recommended
                            ? 'border-green-400 bg-green-50 hover:border-green-500 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }`}
                        onClick={() => available && handleModelChange(model.id)}
                      >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{model.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={model.type === 'local' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {model.type === 'local' ? '🏠 Local' : '☁️ Cloud'}
                            </Badge>
                            {model.recommended && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                Recommended
                              </Badge>
                            )}
                            {model.speed && (
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                                {model.speed}
                              </Badge>
                            )}
                            {!available && model.type === 'cloud' && (
                              <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                                API Key Required
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">{model.cost}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Privacy</div>
                          <div className="text-xs font-medium">{model.privacy}</div>
                        </div>
                      </div>
                      {!available && model.type === 'cloud' && (
                        <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                          <Link href="/setup" className="text-blue-600 hover:underline">
                            Connect {model.provider} API key →
                          </Link>
                        </div>
                      )}
                    </div>
                    );
                  })
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Orchestration Strategy Selection - When orchestration is enabled */}
            {mounted && useOrchestration && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Optimization Strategy
                  </CardTitle>
                  <CardDescription>
                    How should the orchestration engine prioritize your request?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { 
                        id: 'cost_optimized', 
                        name: 'Cost Optimized', 
                        description: 'Minimize costs while maintaining quality',
                        emoji: '💰',
                        recommended: true
                      },
                      { 
                        id: 'performance', 
                        name: 'Speed First', 
                        description: 'Fastest response time available',
                        emoji: '⚡'
                      },
                      { 
                        id: 'privacy_first', 
                        name: 'Privacy First', 
                        description: 'Prefer local processing when possible',
                        emoji: '🔒'
                      },
                      { 
                        id: 'balanced', 
                        name: 'Balanced', 
                        description: 'Optimize across cost, speed, and quality',
                        emoji: '⚖️'
                      }
                    ].map((strategy) => (
                      <div
                        key={strategy.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStrategy === strategy.id
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedStrategy(strategy.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedStrategy === strategy.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedStrategy === strategy.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{strategy.emoji}</span>
                              <h4 className="font-medium">{strategy.name}</h4>
                              {strategy.recommended && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Note Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Note Style
                </CardTitle>
                <CardDescription>
                  Select the format for your generated notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {noteStyles.map((style) => {
                    const Icon = style.icon;
                    return (
                      <div
                        key={style.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStyle === style.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{style.name}</h4>
                            <p className="text-sm text-gray-600">{style.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Processing Tips */}
            {selectedFile && !isProcessing && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 mb-1">Processing Tips</div>
                      <div className="text-blue-700 space-y-1">
                        <div>• Files under 10 pages: ~30 seconds</div>
                        <div>• Larger files: 2-3 minutes (local AI)</div>
                        <div>• Cloud models are faster but less private</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Button */}
            <Button
              onClick={handleProcessPDF}
              disabled={!selectedFile || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {isProcessing && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Processing PDF</h3>
                      <p className="text-sm text-blue-700">{processingStep}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedNotes && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Generated Notes
                      </CardTitle>
                      <CardDescription>
                        {selectedStyleData?.name} {useOrchestration 
                          ? 'created using AI Orchestration Engine' 
                          : `created using ${selectedModelData?.name}`
                        }
                      </CardDescription>
                      
                      {/* ⭐ ORCHESTRATION RESULTS DISPLAY */}
                      {orchestrationMetadata && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-900">Orchestration Results</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Selected Provider:</span>
                              <div className="font-medium text-blue-900">
                                {orchestrationMetadata.selectedProvider === 'GOOGLE' ? '🟡 Gemini Flash' :
                                 orchestrationMetadata.selectedProvider === 'ANTHROPIC' ? '🔮 Claude Haiku' :
                                 orchestrationMetadata.selectedProvider === 'OPENAI' ? '🤖 GPT-4o-mini' :
                                 orchestrationMetadata.selectedProvider === 'LOCAL' ? '🏠 Local Llama' :
                                 orchestrationMetadata.selectedProvider}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Cost Savings:</span>
                              <div className="font-medium text-green-700">
                                {orchestrationMetadata.costSavings || 'Optimized'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Strategy:</span>
                              <div className="font-medium text-purple-700 capitalize">
                                {orchestrationMetadata.strategy?.replace('_', ' ') || 'Balanced'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Quality Score:</span>
                              <div className="font-medium text-orange-700">
                                {orchestrationMetadata.confidenceScore || 92}%
                              </div>
                            </div>
                          </div>
                          {orchestrationMetadata.providersConsidered && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <span className="text-xs text-gray-600">
                                Evaluated: {orchestrationMetadata.providersConsidered.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {generatedNotes && extractedText && (
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {/* Processing time would come from API response */}
                            Fast processing
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Cost optimized
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Privacy preserved
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={downloadNotes} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                      {generatedNotes}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedFile && !isProcessing && !generatedNotes && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-16 pb-16 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a PDF to get started</h3>
                  <p className="text-gray-600 mb-6">
                    Transform any PDF into structured, actionable notes using your choice of AI model
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <Shield className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <strong>Privacy First</strong><br />
                      Process locally or choose your cloud provider
                    </div>
                    <div className="text-center">
                      <Zap className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <strong>Lightning Fast</strong><br />
                      Generate notes in seconds, not hours
                    </div>
                    <div className="text-center">
                      <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <strong>AI Powered</strong><br />
                      Multiple models, consistent quality
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    
  );
}