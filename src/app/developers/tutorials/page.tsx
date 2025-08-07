'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
import { SimpleStars } from '@/components/ui/simple-stars';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  ArrowRight, 
  Copy,
  Check,
  BookOpen,
  Code2,
  FileText,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  User,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Cpu,
  MessageSquare,
  BarChart3,
  FileSearch,
  Bot,
  Zap,
  DollarSign,
  Shield
} from 'lucide-react';

const tutorials = [
  {
    id: 'smart-content-creator',
    title: 'Build a Smart Content Creator',
    description: 'Create an AI-powered content creation tool that generates blog posts, social media content, and marketing copy',
    difficulty: 'Intermediate',
    duration: '45 minutes',
    icon: FileText,
    learningObjectives: [
      'Multi-provider content generation strategies',
      'Template-based prompt engineering',
      'Content quality scoring and optimization',
      'Cost-effective provider selection for different content types'
    ],
    prerequisites: [
      'Basic JavaScript/Node.js knowledge',
      'COSMARA SDK installed',
      'API keys for at least 2 providers',
      'Understanding of content marketing basics'
    ],
    whatYoullBuild: [
      'Blog post generator with SEO optimization',
      'Social media content creator for multiple platforms',
      'Marketing copy generator with A/B testing',
      'Content analytics and performance tracking'
    ],
    steps: [
      {
        id: 1,
        title: 'Project Setup & Architecture',
        duration: '8 minutes',
        description: 'Set up the project structure and define our content creation architecture',
        tasks: [
          'Initialize Node.js project with proper structure',
          'Install COSMARA SDK and additional dependencies',
          'Configure environment variables and API keys',
          'Design the content type system and templates'
        ],
        code: `// package.json
{
  "name": "smart-content-creator",
  "version": "1.0.0",
  "description": "AI-powered content creation tool",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node src/test.js",
    "generate": "node src/cli.js"
  },
  "dependencies": {
    "@cosmara-ai/community-sdk": "^1.0.1",
    "dotenv": "^16.3.1",
    "commander": "^11.1.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.1"
  }
}

// src/content-types.js - Content type definitions
export const ContentTypes = {
  BLOG_POST: {
    id: 'blog_post',
    name: 'Blog Post',
    maxTokens: 1200,
    temperature: 0.7,
    preferredProvider: 'anthropic', // Better for long-form content
    template: \`Write a comprehensive blog post about {topic}.

Requirements:
- Target audience: {audience}
- Tone: {tone}
- Word count: {wordCount} words
- Include SEO keywords: {keywords}
- Structure: Introduction, 3-4 main sections, conclusion
- Include actionable tips and examples

Blog post:\`
  },
  SOCIAL_MEDIA: {
    id: 'social_media',
    name: 'Social Media Post',
    maxTokens: 150,
    temperature: 0.8,
    preferredProvider: 'openai', // Good for creative, short content
    template: \`Create an engaging social media post for {platform}.

Topic: {topic}
Tone: {tone}
Target audience: {audience}
Include relevant hashtags: {includeHashtags}
Call-to-action: {cta}

Requirements:
- {platform} character limits and best practices
- Engaging and shareable
- Platform-appropriate formatting

Post:\`
  },
  MARKETING_COPY: {
    id: 'marketing_copy',
    name: 'Marketing Copy',
    maxTokens: 500,
    temperature: 0.6,
    preferredProvider: 'google', // Cost-effective for marketing content
    template: \`Write compelling marketing copy for {product}.

Product/Service: {product}
Target audience: {audience}
Key benefits: {benefits}
Call-to-action: {cta}
Tone: {tone}
Copy type: {copyType} (email, landing page, ad, etc.)

Requirements:
- Focus on benefits, not features
- Create urgency and desire
- Clear and compelling CTA
- Persuasive and conversion-focused

Marketing copy:\`
  }
};`,
        tips: [
          'Use template-based prompts for consistent output quality',
          'Choose providers based on content type strengths',
          'Plan your project structure before coding for better organization'
        ]
      },
      {
        id: 2,
        title: 'Content Generation Engine',
        duration: '15 minutes',
        description: 'Build the core content generation system with multi-provider support',
        tasks: [
          'Create the main ContentCreator class',
          'Implement template processing and variable substitution',
          'Add provider selection logic based on content type',
          'Build content quality scoring system'
        ],
        code: `// src/content-creator.js
import { createClient, APIProvider } from '@cosmara-ai/community-sdk';
import { ContentTypes } from './content-types.js';

export class ContentCreator {
  constructor(config) {
    this.client = createClient(config);
    this.contentHistory = [];
    this.qualityThresholds = {
      blog_post: 0.8,
      social_media: 0.7,
      marketing_copy: 0.85
    };
  }

  async generateContent(contentType, variables, options = {}) {
    const typeConfig = ContentTypes[contentType.toUpperCase()];
    if (!typeConfig) {
      throw new Error(\`Unknown content type: \${contentType}\`);
    }

    console.log(\`🎯 Generating \${typeConfig.name}...\`);
    
    // Process template with variables
    const prompt = this.processTemplate(typeConfig.template, variables);
    
    // Prepare request
    const request = {
      messages: [
        { role: 'system', content: 'You are an expert content creator and copywriter. Create high-quality, engaging content that achieves the specified goals.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || typeConfig.temperature,
      maxTokens: options.maxTokens || typeConfig.maxTokens
    };

    try {
      // Select optimal provider
      const provider = options.provider || await this.selectOptimalProvider(typeConfig, request);
      
      console.log(\`🤖 Using \${provider} for generation...\`);
      
      // Generate content
      const response = await this.client.chat(request, { provider });
      
      // Score content quality
      const qualityScore = await this.scoreContentQuality(response.content, contentType, variables);
      
      const result = {
        content: response.content,
        contentType,
        variables,
        provider: response.provider,
        usage: response.usage,
        qualityScore,
        timestamp: Date.now(),
        metadata: {
          wordCount: this.countWords(response.content),
          characterCount: response.content.length,
          readabilityScore: this.calculateReadability(response.content)
        }
      };

      // Store in history
      this.contentHistory.push(result);
      
      // Check if quality meets threshold
      if (qualityScore < this.qualityThresholds[contentType]) {
        console.log(\`⚠️ Quality score (\${qualityScore.toFixed(2)}) below threshold. Consider regenerating.\`);
      }

      return result;

    } catch (error) {
      console.error('Content generation failed:', error.message);
      throw error;
    }
  }

  processTemplate(template, variables) {
    return template.replace(/\\{(\\w+)\\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  async selectOptimalProvider(typeConfig, request) {
    // If user specified preferred provider, use it
    if (typeConfig.preferredProvider) {
      return typeConfig.preferredProvider;
    }

    // Get cost estimates
    try {
      const estimates = await this.client.estimateCost(request);
      
      // For marketing content, prefer cost-effectiveness
      if (typeConfig.id === 'marketing_copy') {
        return estimates[0].provider; // Cheapest
      }
      
      // For blog posts, prefer quality (Anthropic)
      if (typeConfig.id === 'blog_post') {
        return 'anthropic';
      }
      
      // For social media, prefer creativity (OpenAI)
      return 'openai';
      
    } catch (error) {
      console.log('Cost estimation failed, using default provider');
      return 'openai';
    }
  }

  async scoreContentQuality(content, contentType, variables) {
    // Simple quality scoring based on content characteristics
    let score = 0.5; // Base score
    
    // Length appropriateness
    const wordCount = this.countWords(content);
    const targetWords = parseInt(variables.wordCount) || this.getTargetWordCount(contentType);
    
    if (Math.abs(wordCount - targetWords) / targetWords < 0.2) {
      score += 0.2; // Within 20% of target
    }
    
    // Keyword inclusion (if provided)
    if (variables.keywords) {
      const keywords = variables.keywords.split(',').map(k => k.trim().toLowerCase());
      const contentLower = content.toLowerCase();
      const keywordMatches = keywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;
      
      score += (keywordMatches / keywords.length) * 0.2;
    }
    
    // Structure check (for blog posts)
    if (contentType === 'blog_post') {
      const hasIntroduction = content.toLowerCase().includes('introduction') || 
                             content.toLowerCase().includes('intro');
      const hasConclusion = content.toLowerCase().includes('conclusion') || 
                           content.toLowerCase().includes('summary');
      const hasSections = (content.match(/\\n\\n/g) || []).length >= 3;
      
      if (hasIntroduction) score += 0.1;
      if (hasConclusion) score += 0.1;
      if (hasSections) score += 0.1;
    }
    
    // Call-to-action check (for marketing content)
    if (contentType === 'marketing_copy' && variables.cta) {
      const ctaWords = ['sign up', 'buy now', 'learn more', 'get started', 'download', 'subscribe'];
      const hasCtaLanguage = ctaWords.some(phrase => 
        content.toLowerCase().includes(phrase)
      );
      if (hasCtaLanguage) score += 0.1;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  countWords(text) {
    return text.trim().split(/\\s+/).length;
  }

  calculateReadability(text) {
    // Simple readability score (sentences per 100 words)
    const sentences = (text.match(/[.!?]+/g) || []).length;
    const words = this.countWords(text);
    return sentences / (words / 100);
  }

  getTargetWordCount(contentType) {
    const defaults = {
      blog_post: 800,
      social_media: 25,
      marketing_copy: 150
    };
    return defaults[contentType] || 200;
  }

  // Generate multiple variations for A/B testing
  async generateVariations(contentType, variables, count = 3) {
    console.log(\`🔄 Generating \${count} variations for A/B testing...\`);
    
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      console.log(\`Creating variation \${i + 1}/\${count}...\`);
      
      // Slightly vary temperature for different creative approaches
      const temperatureVariation = 0.1 * (i - 1); // -0.1, 0, +0.1
      const baseTemp = ContentTypes[contentType.toUpperCase()].temperature;
      
      try {
        const variation = await this.generateContent(contentType, variables, {
          temperature: Math.max(0.1, Math.min(2.0, baseTemp + temperatureVariation))
        });
        
        variation.variationId = i + 1;
        variations.push(variation);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(\`Failed to generate variation \${i + 1}:\`, error.message);
      }
    }
    
    // Rank by quality score
    variations.sort((a, b) => b.qualityScore - a.qualityScore);
    
    console.log(\`✅ Generated \${variations.length} variations\`);
    console.log('Quality ranking:');
    variations.forEach((v, idx) => {
      console.log(\`  \${idx + 1}. Variation \${v.variationId}: \${v.qualityScore.toFixed(2)} score\`);
    });
    
    return variations;
  }

  getContentHistory(contentType = null) {
    if (contentType) {
      return this.contentHistory.filter(item => item.contentType === contentType);
    }
    return this.contentHistory;
  }

  getAnalytics() {
    const totalContent = this.contentHistory.length;
    const totalCost = this.contentHistory.reduce((sum, item) => sum + (item.usage?.cost || 0), 0);
    
    const providerStats = {};
    const typeStats = {};
    
    this.contentHistory.forEach(item => {
      // Provider stats
      if (!providerStats[item.provider]) {
        providerStats[item.provider] = { count: 0, cost: 0, avgQuality: 0 };
      }
      providerStats[item.provider].count++;
      providerStats[item.provider].cost += item.usage?.cost || 0;
      providerStats[item.provider].avgQuality += item.qualityScore;
      
      // Content type stats
      if (!typeStats[item.contentType]) {
        typeStats[item.contentType] = { count: 0, cost: 0, avgQuality: 0 };
      }
      typeStats[item.contentType].count++;
      typeStats[item.contentType].cost += item.usage?.cost || 0;
      typeStats[item.contentType].avgQuality += item.qualityScore;
    });
    
    // Calculate averages
    Object.values(providerStats).forEach(stats => {
      stats.avgQuality /= stats.count;
    });
    Object.values(typeStats).forEach(stats => {
      stats.avgQuality /= stats.count;
    });
    
    return {
      totalContent,
      totalCost,
      averageQuality: this.contentHistory.reduce((sum, item) => sum + item.qualityScore, 0) / totalContent,
      providerStats,
      typeStats,
      recentContent: this.contentHistory.slice(-5)
    };
  }
}`,
        tips: [
          'Implement quality scoring to ensure consistent output',
          'Use different providers for different content types based on their strengths',
          'Generate variations for A/B testing to optimize conversion rates'
        ]
      },
      {
        id: 3,
        title: 'CLI Interface & Content Management',
        duration: '12 minutes',
        description: 'Create a command-line interface for easy content generation and management',
        tasks: [
          'Build CLI using Commander.js',
          'Add interactive prompts for content variables',
          'Implement content export and formatting options',
          'Create content management and history features'
        ],
        code: `// src/cli.js
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ContentCreator } from './content-creator.js';
import { ContentTypes } from './content-types.js';
import 'dotenv/config';

const program = new Command();
const creator = new ContentCreator({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY
  },
  enableUsageTracking: true
});

program
  .name('content-creator')
  .description('AI-powered content creation tool')
  .version('1.0.0');

// Generate content command
program
  .command('generate')
  .alias('g')
  .description('Generate content using AI')
  .option('-t, --type <type>', 'Content type (blog_post, social_media, marketing_copy)')
  .option('-o, --output <file>', 'Output file path')
  .option('--variations <count>', 'Generate multiple variations', parseInt)
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🚀 Smart Content Creator'));
      console.log(chalk.gray('Generate high-quality content with AI\\n'));

      // Get content type
      const contentType = options.type || await promptForContentType();
      const typeConfig = ContentTypes[contentType.toUpperCase()];
      
      console.log(chalk.green(\`Creating \${typeConfig.name}...\\n\`));

      // Collect variables based on content type
      const variables = await collectVariables(contentType);
      
      // Show configuration
      console.log(chalk.yellow('Configuration:'));
      Object.entries(variables).forEach(([key, value]) => {
        console.log(\`  \${key}: \${value}\`);
      });
      console.log();

      // Generate content
      const spinner = ora('Generating content...').start();
      
      try {
        let results;
        
        if (options.variations && options.variations > 1) {
          spinner.text = \`Generating \${options.variations} variations...\`;
          results = await creator.generateVariations(contentType, variables, options.variations);
        } else {
          results = [await creator.generateContent(contentType, variables)];
        }
        
        spinner.succeed('Content generated successfully!');
        
        // Display results
        results.forEach((result, index) => {
          console.log(chalk.blue.bold(\`\\n--- \${results.length > 1 ? \`Variation \${index + 1}\` : 'Generated Content'} ---\`));
          console.log(chalk.white(result.content));
          console.log(chalk.gray(\`\\nProvider: \${result.provider} | Quality: \${result.qualityScore.toFixed(2)} | Words: \${result.metadata.wordCount} | Cost: $\${result.usage?.cost?.toFixed(6) || 'N/A'}\`));
        });
        
        // Save to file if requested
        if (options.output) {
          const content = results.map((r, i) => 
            \`\${results.length > 1 ? \`=== Variation \${i + 1} ===\\n\` : ''}\${r.content}\`
          ).join('\\n\\n');
          
          await fs.writeFile(options.output, content);
          console.log(chalk.green(\`\\n💾 Content saved to \${options.output}\`));
        }
        
      } catch (error) {
        spinner.fail('Content generation failed');
        console.error(chalk.red('Error:', error.message));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('CLI Error:', error.message));
      process.exit(1);
    }
  });

// Analytics command
program
  .command('analytics')
  .alias('a')
  .description('View content creation analytics')
  .action(() => {
    const analytics = creator.getAnalytics();
    
    console.log(chalk.blue.bold('📊 Content Analytics\\n'));
    
    console.log(chalk.yellow('Overview:'));
    console.log(\`  Total content pieces: \${analytics.totalContent}\`);
    console.log(\`  Total cost: $\${analytics.totalCost.toFixed(4)}\`);
    console.log(\`  Average quality: \${analytics.averageQuality.toFixed(2)}\\n\`);
    
    console.log(chalk.yellow('By Provider:'));
    Object.entries(analytics.providerStats).forEach(([provider, stats]) => {
      console.log(\`  \${provider}: \${stats.count} pieces, $\${stats.cost.toFixed(4)}, \${stats.avgQuality.toFixed(2)} avg quality\`);
    });
    
    console.log(chalk.yellow('\\nBy Content Type:'));
    Object.entries(analytics.typeStats).forEach(([type, stats]) => {
      console.log(\`  \${type}: \${stats.count} pieces, $\${stats.cost.toFixed(4)}, \${stats.avgQuality.toFixed(2)} avg quality\`);
    });
  });

// Interactive variable collection
async function collectVariables(contentType) {
  const variables = {};
  
  switch (contentType) {
    case 'blog_post':
      variables.topic = await prompt('Blog post topic: ');
      variables.audience = await prompt('Target audience: ');
      variables.tone = await prompt('Tone (professional/casual/friendly): ') || 'professional';
      variables.wordCount = await prompt('Word count (default 800): ') || '800';
      variables.keywords = await prompt('SEO keywords (comma-separated): ') || '';
      break;
      
    case 'social_media':
      variables.platform = await prompt('Platform (twitter/linkedin/facebook/instagram): ') || 'twitter';
      variables.topic = await prompt('Post topic: ');
      variables.audience = await prompt('Target audience: ');
      variables.tone = await prompt('Tone (casual/professional/playful): ') || 'casual';
      variables.includeHashtags = await prompt('Include hashtags? (yes/no): ') || 'yes';
      variables.cta = await prompt('Call-to-action: ') || 'engage with this post';
      break;
      
    case 'marketing_copy':
      variables.product = await prompt('Product/Service name: ');
      variables.audience = await prompt('Target audience: ');
      variables.benefits = await prompt('Key benefits (comma-separated): ');
      variables.cta = await prompt('Call-to-action: ');
      variables.tone = await prompt('Tone (persuasive/friendly/urgent): ') || 'persuasive';
      variables.copyType = await prompt('Copy type (email/landing/ad): ') || 'email';
      break;
  }
  
  return variables;
}

// Simple prompt function (in real app, use inquirer.js)
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(chalk.cyan(question));
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function promptForContentType() {
  console.log(chalk.yellow('Available content types:'));
  Object.values(ContentTypes).forEach((type, index) => {
    console.log(\`  \${index + 1}. \${type.name}\`);
  });
  
  const choice = await prompt('\\nSelect content type (1-3): ');
  const types = Object.keys(ContentTypes);
  const selectedType = types[parseInt(choice) - 1];
  
  if (!selectedType) {
    throw new Error('Invalid content type selection');
  }
  
  return selectedType.toLowerCase();
}

program.parse();`,
        tips: [
          'Use ora for loading spinners to improve user experience',
          'Implement proper error handling and user feedback',
          'Save generated content with metadata for future reference'
        ]
      },
      {
        id: 4,
        title: 'Advanced Features & Optimization',
        duration: '10 minutes',
        description: 'Add advanced features like content optimization, SEO analysis, and performance tracking',
        tasks: [
          'Implement SEO optimization features',
          'Add content performance tracking',
          'Create content templates and reusable snippets',
          'Build content comparison and analysis tools'
        ],
        code: `// src/content-optimizer.js
export class ContentOptimizer {
  constructor(contentCreator) {
    this.creator = contentCreator;
    this.seoKeywords = new Map(); // Cache popular keywords
    this.performanceData = new Map(); // Track content performance
  }

  async optimizeForSEO(content, keywords, contentType) {
    console.log('🔍 Performing SEO optimization...');
    
    const analysis = {
      keywordDensity: this.analyzeKeywordDensity(content, keywords),
      readabilityScore: this.calculateReadabilityScore(content),
      headingStructure: this.analyzeHeadingStructure(content),
      metaData: this.generateMetaData(content, keywords),
      suggestions: []
    };
    
    // Generate improvement suggestions
    if (analysis.keywordDensity < 0.01) {
      analysis.suggestions.push('Consider increasing keyword density (currently too low)');
    }
    if (analysis.keywordDensity > 0.03) {
      analysis.suggestions.push('Reduce keyword density to avoid over-optimization');
    }
    if (analysis.readabilityScore > 15) {
      analysis.suggestions.push('Simplify sentence structure for better readability');
    }
    if (contentType === 'blog_post' && !analysis.headingStructure.hasH2) {
      analysis.suggestions.push('Add H2 headings to improve content structure');
    }
    
    return analysis;
  }

  analyzeKeywordDensity(content, keywords) {
    const words = content.toLowerCase().split(/\\s+/);
    const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase());
    
    let keywordCount = 0;
    keywordArray.forEach(keyword => {
      const regex = new RegExp(\`\\\\b\${keyword}\\\\b\`, 'gi');
      const matches = content.match(regex);
      if (matches) keywordCount += matches.length;
    });
    
    return keywordCount / words.length;
  }

  calculateReadabilityScore(content) {
    // Flesch Reading Ease approximation
    const sentences = content.split(/[.!?]+/).length - 1;
    const words = content.split(/\\s+/).length;
    const syllables = this.countSyllables(content);
    
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  countSyllables(text) {
    // Simple syllable counting
    const words = text.toLowerCase().match(/\\b[a-z]+\\b/g) || [];
    return words.reduce((count, word) => {
      const syllables = word.match(/[aeiouy]{1,2}/g) || [];
      return count + Math.max(1, syllables.length);
    }, 0);
  }

  analyzeHeadingStructure(content) {
    return {
      hasH1: /^#\\s/.test(content) || /<h1>/i.test(content),
      hasH2: /^##\\s/.test(content) || /<h2>/i.test(content),
      hasH3: /^###\\s/.test(content) || /<h3>/i.test(content),
      headingCount: (content.match(/^#{1,6}\\s/gm) || []).length
    };
  }

  generateMetaData(content, keywords) {
    // Extract first sentence as meta description
    const firstSentence = content.split(/[.!?]/)[0];
    const metaDescription = firstSentence.length > 160 ? 
      firstSentence.substring(0, 157) + '...' : firstSentence;
    
    // Generate title suggestions
    const titleSuggestions = [
      \`\${keywords.split(',')[0]} - Complete Guide\`,
      \`How to \${keywords.split(',')[0]}\`,
      \`\${keywords.split(',')[0]}: Everything You Need to Know\`
    ];
    
    return {
      metaDescription,
      titleSuggestions,
      suggestedSlug: this.generateSlug(keywords.split(',')[0])
    };
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\\w\\s-]/g, '')
      .replace(/[\\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Track content performance
  recordPerformance(contentId, metrics) {
    this.performanceData.set(contentId, {
      ...metrics,
      timestamp: Date.now()
    });
  }

  getTopPerformingContent(limit = 5) {
    const sorted = Array.from(this.performanceData.entries())
      .sort(([,a], [,b]) => (b.engagementRate || 0) - (a.engagementRate || 0))
      .slice(0, limit);
    
    return sorted.map(([id, data]) => ({ id, ...data }));
  }

  // Generate content templates
  createTemplate(name, contentType, variables, placeholders) {
    const template = {
      name,
      contentType,
      variables,
      placeholders,
      usage: 0,
      createdAt: Date.now()
    };
    
    // Save template (in real app, save to database)
    console.log(\`📄 Template "\${name}" created for \${contentType}\`);
    return template;
  }
}

// src/performance-tracker.js
export class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
    this.benchmarks = {
      blog_post: { avgEngagement: 0.03, avgShares: 5, avgTime: 180 },
      social_media: { avgEngagement: 0.05, avgShares: 2, avgTime: 30 },
      marketing_copy: { avgConversion: 0.025, avgClickThrough: 0.03 }
    };
  }

  trackContent(contentId, contentType, initialMetrics = {}) {
    this.metrics.set(contentId, {
      contentType,
      created: Date.now(),
      views: 0,
      engagement: 0,
      shares: 0,
      conversions: 0,
      ...initialMetrics
    });
  }

  updateMetrics(contentId, newMetrics) {
    const existing = this.metrics.get(contentId);
    if (existing) {
      this.metrics.set(contentId, { ...existing, ...newMetrics });
    }
  }

  generatePerformanceReport(contentType = null) {
    const relevantMetrics = Array.from(this.metrics.entries())
      .filter(([, data]) => !contentType || data.contentType === contentType);

    if (relevantMetrics.length === 0) {
      return { message: 'No performance data available' };
    }

    const totalViews = relevantMetrics.reduce((sum, [, data]) => sum + data.views, 0);
    const totalEngagement = relevantMetrics.reduce((sum, [, data]) => sum + data.engagement, 0);
    const avgEngagementRate = totalEngagement / totalViews;

    const topPerformers = relevantMetrics
      .sort(([,a], [,b]) => (b.engagement / (b.views || 1)) - (a.engagement / (a.views || 1)))
      .slice(0, 5);

    return {
      totalContent: relevantMetrics.length,
      totalViews,
      totalEngagement,
      avgEngagementRate,
      topPerformers: topPerformers.map(([id, data]) => ({
        id,
        engagementRate: data.engagement / (data.views || 1),
        ...data
      }))
    };
  }
}`,
        tips: [
          'Implement SEO best practices to improve content discoverability',
          'Track performance metrics to continuously improve content quality',
          'Create reusable templates for consistent content creation'
        ]
      }
    ]
  },
  {
    id: 'customer-service-bot',
    title: 'Create a Customer Service Bot',
    description: 'Build an intelligent customer service chatbot with knowledge base, ticket creation, and escalation workflows',
    difficulty: 'Advanced',
    duration: '60 minutes',
    icon: Bot,
    learningObjectives: [
      'Knowledge base integration and RAG implementation',
      'Intent classification and routing',
      'Escalation workflows and human handoff',
      'Multi-language support and sentiment analysis'
    ],
    prerequisites: [
      'Intermediate JavaScript knowledge',
      'Understanding of chatbot concepts',
      'COSMARA SDK experience',
      'Basic knowledge of customer service workflows'
    ],
    whatYoullBuild: [
      'Intelligent chatbot with knowledge base search',
      'Intent classification and automated routing',
      'Ticket creation and tracking system',
      'Escalation workflows with sentiment analysis'
    ],
    steps: [
      {
        id: 1,
        title: 'Bot Architecture & Knowledge Base',
        duration: '20 minutes',
        description: 'Design the bot architecture and implement knowledge base functionality',
        code: `// Knowledge base and intent classification implementation
        // Detailed customer service bot architecture with RAG and intent classification`
      }
    ]
  },
  {
    id: 'data-analysis-tool',
    title: 'Build a Data Analysis Tool',
    description: 'Create an AI-powered data analysis tool that generates insights, visualizations, and reports from datasets',
    difficulty: 'Advanced',
    duration: '55 minutes',
    icon: BarChart3,
    learningObjectives: [
      'Data processing and analysis with AI',
      'Automated insight generation',
      'Chart and visualization creation',
      'Report generation and formatting'
    ],
    prerequisites: [
      'JavaScript and data manipulation',
      'Basic statistics knowledge',
      'COSMARA SDK familiarity',
      'Understanding of data visualization concepts'
    ],
    whatYoullBuild: [
      'CSV data processor and analyzer',
      'AI-powered insight generator',
      'Automated chart creation system',
      'Professional report generator'
    ],
    steps: [
      {
        id: 1,
        title: 'Data Processing Engine',
        duration: '18 minutes',
        description: 'Build the core data processing and analysis engine',
        code: `// Data analysis engine implementation
        // Statistical analysis and insight generation`
      }
    ]
  }
];

export default function TutorialsPage() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'Intermediate': return 'text-golden-nebula border-golden-nebula/30 bg-golden-nebula/10';
      case 'Advanced': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      default: return 'text-text-secondary border-space-light/30 bg-space-light/10';
    }
  };

  return (
    <MainLayout>
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb 
              items={[
                { label: 'Developers', href: '/developers' },
                { label: 'Tutorials' }
              ]} 
            />
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <BookOpen className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium text-text-primary">Step-by-Step Tutorials</span>
            </div>
            
            <h1 className="text-hero-glass mb-6 leading-tight">
              <span className="text-stardust-muted">Build Real-World</span>
              <br />
              <span className="text-glass-gradient">AI Applications</span>
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
              Follow detailed, step-by-step tutorials to build complete AI applications. 
              Each tutorial includes code, explanations, and best practices for production-ready apps.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center text-sm text-text-secondary">
                <Target className="h-4 w-4 mr-2 text-green-400" />
                Goal-oriented projects
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <Code2 className="h-4 w-4 mr-2 text-cosmic-blue" />
                Complete code examples
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <Lightbulb className="h-4 w-4 mr-2 text-stellar-purple" />
                Best practices included
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-8">
            {tutorials.map((tutorial) => {
              const Icon = tutorial.icon;
              const isExpanded = selectedTutorial === tutorial.id;
              
              return (
                <Card key={tutorial.id} className="glass-card border-space-light/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg flex items-center justify-center"
                             style={{ 
                               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' 
                             }}>
                          <Icon className="h-6 w-6 text-cosmic-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl text-text-primary">
                              {tutorial.title}
                            </CardTitle>
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              {tutorial.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {tutorial.duration}
                            </Badge>
                          </div>
                          <CardDescription className="text-text-secondary leading-relaxed">
                            {tutorial.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTutorial(isExpanded ? null : tutorial.id)}
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="space-y-8 pt-0">
                      {/* Learning Objectives */}
                      <div>
                        <h4 className="font-medium text-text-primary mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-green-400" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                          {tutorial.learningObjectives.map((objective, idx) => (
                            <li key={idx} className="flex items-start text-sm text-text-secondary">
                              <Check className="h-3 w-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prerequisites */}
                      <div>
                        <h4 className="font-medium text-text-primary mb-3 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-400" />
                          Prerequisites
                        </h4>
                        <ul className="space-y-2">
                          {tutorial.prerequisites.map((prereq, idx) => (
                            <li key={idx} className="flex items-start text-sm text-text-secondary">
                              <Check className="h-3 w-3 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                              {prereq}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What You'll Build */}
                      <div>
                        <h4 className="font-medium text-text-primary mb-3 flex items-center">
                          <Cpu className="h-4 w-4 mr-2 text-cosmic-blue" />
                          What You'll Build
                        </h4>
                        <ul className="space-y-2">
                          {tutorial.whatYoullBuild.map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-text-secondary">
                              <Check className="h-3 w-3 text-cosmic-blue mr-2 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tutorial Steps */}
                      <div>
                        <h4 className="font-medium text-text-primary mb-4 flex items-center">
                          <Play className="h-4 w-4 mr-2 text-stellar-purple" />
                          Tutorial Steps
                        </h4>
                        <div className="space-y-4">
                          {tutorial.steps.map((step) => (
                            <Card key={step.id} className="glass-card border-space-light/20">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-stellar-purple/20 flex items-center justify-center">
                                      <span className="text-stellar-purple font-bold text-sm">{step.id}</span>
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg text-text-primary">
                                        {step.title}
                                      </CardTitle>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {step.duration}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleStepExpansion(`${tutorial.id}-${step.id}`)}
                                  >
                                    {expandedSteps.includes(`${tutorial.id}-${step.id}`) ? 
                                      <ChevronDown className="h-4 w-4" /> : 
                                      <ChevronRight className="h-4 w-4" />
                                    }
                                  </Button>
                                </div>
                                <CardDescription className="text-text-secondary">
                                  {step.description}
                                </CardDescription>
                              </CardHeader>
                              
                              {expandedSteps.includes(`${tutorial.id}-${step.id}`) && (
                                <CardContent className="space-y-6">
                                  {/* Tasks */}
                                  <div>
                                    <h5 className="font-medium text-text-primary mb-3">Tasks to Complete</h5>
                                    <ul className="space-y-2">
                                      {step.tasks.map((task, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-text-secondary">
                                          <CheckCircle className="h-3 w-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                          {task}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Code */}
                                  {step.code && (
                                    <div>
                                      <h5 className="font-medium text-text-primary mb-3">Implementation Code</h5>
                                      <div className="relative">
                                        <pre className="bg-dark-obsidian text-stardust p-4 rounded-lg text-sm overflow-x-auto border border-space-light/20 max-h-96 overflow-y-auto">
                                          <code>{step.code}</code>
                                        </pre>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="absolute top-2 right-2 h-8 w-8 p-0"
                                          onClick={() => copyToClipboard(step.code, `step-${tutorial.id}-${step.id}`)}
                                        >
                                          {copiedCode === `step-${tutorial.id}-${step.id}` ? 
                                            <Check className="h-3 w-3 text-green-400" /> : 
                                            <Copy className="h-3 w-3" />
                                          }
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Tips */}
                                  {step.tips && (
                                    <div>
                                      <h5 className="font-medium text-text-primary mb-3">Pro Tips</h5>
                                      <ul className="space-y-2">
                                        {step.tips.map((tip, idx) => (
                                          <li key={idx} className="flex items-start text-sm text-text-secondary">
                                            <Lightbulb className="h-3 w-3 text-golden-nebula mr-2 mt-0.5 flex-shrink-0" />
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Tutorial Actions */}
                      <div className="flex gap-4 pt-6 border-t border-space-light/20">
                        <Button asChild>
                          <Link href="/developers/quick-start">
                            Start This Tutorial
                            <Play className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/developers/examples">
                            View Examples
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 bg-space-depth/30">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-golden-nebula/30" 
                style={{ background: 'rgba(255, 215, 0, 0.05)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-golden-nebula text-2xl">
                <Lightbulb className="h-6 w-6 mr-3" />
                Ready to Start Learning?
              </CardTitle>
              <CardDescription className="text-text-secondary text-lg">
                Choose a tutorial that matches your goals and start building amazing AI applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-cosmic-blue/50 transition-colors" asChild>
                  <Link href="/developers/quick-start">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-cosmic-blue/20 flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-6 w-6 text-cosmic-blue" />
                      </div>
                      <CardTitle className="text-lg">Quick Start</CardTitle>
                      <CardDescription className="text-center">
                        New to COSMARA? Start with the basics
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-stellar-purple/50 transition-colors" asChild>
                  <Link href="/developers/examples">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-stellar-purple/20 flex items-center justify-center mx-auto mb-4">
                        <Code2 className="h-6 w-6 text-stellar-purple" />
                      </div>
                      <CardTitle className="text-lg">Examples</CardTitle>
                      <CardDescription className="text-center">
                        Browse working code examples
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-orange-400/50 transition-colors" asChild>
                  <Link href="/developers/api-reference">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-orange-400/20 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6 text-orange-400" />
                      </div>
                      <CardTitle className="text-lg">API Reference</CardTitle>
                      <CardDescription className="text-center">
                        Detailed SDK documentation
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button size="lg" asChild>
                  <Link href="/developers/quick-start">
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/developers/examples">
                    Browse Examples
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/developers/troubleshooting">
                    Get Help
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}