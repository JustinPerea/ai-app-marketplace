'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppDetailNavigation } from '@/components/navigation/app-detail-navigation';
// Using standard HTML elements since Textarea and Select components are not available
import { 
  Star, 
  Download, 
  Shield, 
  Code2,
  AlertTriangle,
  CheckCircle,
  Github,
  GitPullRequest,
  Bug,
  Zap,
  Settings,
  Users,
  Clock,
  BarChart3,
  FileText,
  Play,
  Eye,
  DollarSign,
  Rocket,
  Search
} from 'lucide-react';

export default function CodeReviewBotPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'pricing' | 'reviews'>('overview');
  const [githubUrl, setGithubUrl] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [reviewType, setReviewType] = useState<'security' | 'performance' | 'quality' | 'comprehensive'>('comprehensive');
  const [providerPreference, setProviderPreference] = useState<'cost-optimized' | 'quality-optimized' | 'balanced'>('balanced');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runCodeReview = async () => {
    if (!codeInput.trim()) {
      setError('Please enter code to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setReviewResult(null);
    
    try {
      const response = await fetch('/api/apps/code-review-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeInput,
          reviewType,
          providerPreference,
          apiKey: apiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code review failed');
      }

      setReviewResult(data);
    } catch (error) {
      console.error('Code review error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during code review');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const appStats = {
    rating: 4.7,
    reviews: 342,
    installs: '15.4K',
    lastUpdated: '3 days ago',
    developer: 'DevSecure',
    version: '3.2.1'
  };

  const features = [
    {
      icon: Shield,
      title: 'Security Analysis',
      description: 'Detects security vulnerabilities, hardcoded secrets, and common attack vectors across 20+ languages'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Identifies performance bottlenecks, memory leaks, and inefficient algorithms'
    },
    {
      icon: Code2,
      title: 'Code Quality',
      description: 'Enforces coding standards, detects code smells, and suggests refactoring opportunities'
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Seamlessly integrates with GitHub PRs, providing automated reviews with detailed comments'
    },
    {
      icon: BarChart3,
      title: 'Metrics & Analytics',
      description: 'Tracks code quality metrics, technical debt, and improvement trends over time'
    },
    {
      icon: Clock,
      title: '50% Faster Reviews',
      description: 'Reduces code review time from 2-3 hours to 45-60 minutes per pull request'
    }
  ];

  const supportedLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 
    'Ruby', 'C++', 'Kotlin', 'Swift', 'Scala', 'R', 'SQL', 'Shell', 'Dockerfile', 'YAML'
  ];

  const integrations = [
    {
      name: 'GitHub',
      description: 'Automatic PR reviews with inline comments',
      supported: true
    },
    {
      name: 'GitLab',
      description: 'Merge request analysis and reporting',
      supported: true
    },
    {
      name: 'Bitbucket',
      description: 'Pull request automation',
      supported: true
    },
    {
      name: 'Azure DevOps',
      description: 'Integration with Azure Repos',
      supported: false
    }
  ];

  const aiProviders = [
    {
      name: 'GPT-4',
      description: 'Best for complex code analysis and security detection',
      recommended: true,
      cost: '$0.03 per 1K tokens'
    },
    {
      name: 'Claude 3.5 Sonnet',  
      description: 'Excellent for code quality and refactoring suggestions',
      recommended: true,
      cost: '$0.015 per 1K tokens'
    },
    {
      name: 'GPT-3.5 Turbo',
      description: 'Fast and cost-effective for basic code reviews',
      recommended: false,
      cost: '$0.001 per 1K tokens'
    }
  ];

  const pricingTiers = [
    {
      name: 'Developer',
      price: '$49',
      period: '/month',
      description: 'Perfect for individual developers and small teams',
      features: [
        '100 PR reviews per month',
        'All programming languages',
        'Security vulnerability detection',
        'GitHub integration',
        'Email support'
      ],
      popular: true
    },
    {
      name: 'Team',
      price: '$149',
      period: '/month',
      description: 'For growing development teams',
      features: [
        'Unlimited PR reviews',
        'Team analytics dashboard',
        'Custom rules and policies',
        'Slack/Teams notifications',
        'Priority support',
        'Multi-repository support'
      ],
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with specific needs',
      features: [
        'Everything in Team plan',
        'On-premise deployment',
        'Custom integrations',
        'SLA guarantees', 
        'Dedicated support',
        'Training and onboarding'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Developer, TechCorp',
      rating: 5,
      text: 'This bot caught security vulnerabilities that we completely missed in manual reviews. The GitHub integration is seamless and the analysis is incredibly thorough.'
    },
    {
      name: 'Sarah Rodriguez',
      role: 'Engineering Manager, StartupXYZ',
      rating: 5,
      text: 'Cut our code review time in half while actually improving code quality. The performance suggestions helped us optimize our API response times by 40%.'
    },
    {
      name: 'Michael Kim',
      role: 'CTO, DevStudio',
      rating: 4,
      text: 'Great tool for maintaining coding standards across our remote team. The detailed explanations help junior developers learn best practices.'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Supported Languages */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Supported Programming Languages</h3>
              <div className="flex flex-wrap gap-2">
                {supportedLanguages.map((language, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Providers */}
            <div>
              <h3 className="text-xl font-semibold mb-4">AI Provider Options</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {aiProviders.map((provider, index) => (
                  <Card key={index} className={provider.recommended ? 'border-purple-500' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        {provider.recommended && (
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{provider.cost}</div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{provider.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Platform Integrations</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {integrations.map((integration, index) => (
                  <Card key={index} className={integration.supported ? '' : 'opacity-50'}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {integration.supported ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">{integration.description}</CardDescription>
                      {!integration.supported && (
                        <Badge variant="outline" className="text-xs mt-2">Coming Soon</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div>
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <GitPullRequest className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">1. PR Created</h4>
                  <p className="text-sm text-gray-600">Bot automatically detects new pull requests</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">2. AI Analysis</h4>
                  <p className="text-sm text-gray-600">Multi-model analysis for security, performance, and quality</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">3. Generate Report</h4>
                  <p className="text-sm text-gray-600">Detailed findings with specific recommendations</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Github className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">4. Post Comments</h4>
                  <p className="text-sm text-gray-600">Inline comments on GitHub with actionable feedback</p>
                </div>
              </div>
            </div>

            {/* BYOK Benefits */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Shield className="h-5 w-5 mr-2" />
                  Bring Your Own Keys (BYOK)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <p className="mb-3">
                  Use your own OpenAI or Anthropic API keys for maximum cost control and data security. 
                  Your code never leaves your control.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Cost Control:</strong> Pay only for what you use, no markup
                  </div>
                  <div>
                    <strong>Data Privacy:</strong> Your code stays between you and your chosen AI provider
                  </div>
                  <div>
                    <strong>Flexibility:</strong> Switch between models based on your needs
                  </div>
                  <div>
                    <strong>Transparency:</strong> See exact usage and costs in real-time
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'demo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Live Code Review Demo</h3>
              <p className="text-gray-600 mb-6">
                Paste your code below and experience real AI-powered analysis with intelligent cost optimization.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Code Input & Configuration</CardTitle>
                  <CardDescription>
                    Configure your analysis preferences and paste code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Review Type Selection */}
                  <div>
                    <Label htmlFor="review-type">Review Type</Label>
                    <select 
                      id="review-type"
                      value={reviewType} 
                      onChange={(e) => setReviewType(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="comprehensive">🔍 Comprehensive Review</option>
                      <option value="security">🛡️ Security Analysis</option>
                      <option value="performance">⚡ Performance Review</option>
                      <option value="quality">🏗️ Code Quality</option>
                    </select>
                  </div>

                  {/* Provider Preference */}
                  <div>
                    <Label htmlFor="provider-preference">Cost Strategy</Label>
                    <select 
                      id="provider-preference"
                      value={providerPreference} 
                      onChange={(e) => setProviderPreference(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="cost-optimized">💰 Cost Optimized (Cheapest)</option>
                      <option value="balanced">⚖️ Balanced (Recommended)</option>
                      <option value="quality-optimized">🎯 Quality Optimized (Best)</option>
                    </select>
                  </div>

                  {/* API Key (Optional) */}
                  <div>
                    <Label htmlFor="api-key">API Key (Optional)</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="OpenAI, Anthropic, or Google AI API key"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use free local Ollama models (if available)
                    </p>
                  </div>

                  {/* Code Input */}
                  <div>
                    <Label htmlFor="code-input">Code to Analyze</Label>
                    <textarea
                      id="code-input"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Paste your code here..."
                      className="mt-1 w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-vertical"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-4">
                        <p className="text-red-700 text-sm">{error}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Button */}
                  <Button 
                    onClick={runCodeReview} 
                    disabled={!codeInput.trim() || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Code...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start AI Code Review
                      </>
                    )}
                  </Button>

                  {/* Sample Code Suggestions */}
                  {!codeInput && !reviewResult && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-blue-700">
                          <strong>Try sample code:</strong><br />
                          • JavaScript function with security issues<br />
                          • Python script with performance problems<br />
                          • Java class with code quality concerns<br />
                          <br />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCodeInput(`function authenticateUser(username, password) {
  const API_KEY = "sk-1234567890abcdef"; // Hardcoded secret!
  
  // SQL injection vulnerability
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  
  // No input validation
  if (username && password) {
    // Synchronous database call blocking event loop
    const result = db.query(query);
    return result.length > 0;
  }
  
  return false;
}`)}
                          >
                            Load JavaScript Sample
                          </Button>
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    Real-time AI analysis with cost optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!reviewResult && !isAnalyzing && (
                    <div className="text-center py-12 text-gray-500">
                      <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter code and click "Start AI Code Review" to see results</p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                      <p className="text-gray-600">Running AI analysis...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
                    </div>
                  )}

                  {reviewResult && (
                    <div className="space-y-4">
                      {/* Cost Optimization Summary */}
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-green-900 mb-2">💰 Cost Optimization</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-green-700">Provider:</span><br />
                              <strong>{reviewResult.metadata?.selectedProvider}</strong>
                            </div>
                            <div>
                              <span className="text-green-700">Cost:</span><br />
                              <strong>${(reviewResult.metadata?.estimatedCost || 0).toFixed(4)}</strong>
                            </div>
                            <div>
                              <span className="text-green-700">Language:</span><br />
                              <strong>{reviewResult.metadata?.language || 'Auto-detected'}</strong>
                            </div>
                            <div>
                              <span className="text-green-700">Complexity:</span><br />
                              <strong className="capitalize">{reviewResult.metadata?.complexity}</strong>
                            </div>
                          </div>
                          {reviewResult.metadata?.cacheHit && (
                            <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                              ⚡ Cache Hit - 100% Cost Savings
                            </Badge>
                          )}
                        </CardContent>
                      </Card>

                      {/* Review Content */}
                      <Card>
                        <CardContent className="pt-4">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                              {reviewResult.review}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Performance Metrics */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-blue-900 mb-2">📊 Performance Metrics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                            <div>Processing Time: <strong>{reviewResult.metadata?.processingTime}ms</strong></div>
                            <div>Tokens Used: <strong>{reviewResult.metadata?.tokensUsed || 'N/A'}</strong></div>
                            <div>AI Model: <strong>{reviewResult.metadata?.aiModel}</strong></div>
                            <div>Code Size: <strong>{Math.round(codeInput.length / 1024 * 100) / 100}KB</strong></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">
                Professional code review automation that scales with your development team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier, index) => (
                <Card key={index} className={`relative ${tier.popular ? 'border-purple-500 shadow-lg' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {tier.price}
                      {tier.period && <span className="text-lg font-normal text-gray-600">{tier.period}</span>}
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                      {tier.name === 'Enterprise' ? 'Contact Sales' : `Start ${tier.name} Plan`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900 mb-2">ROI Calculator</h4>
                  <p className="text-green-800 text-sm">
                    <strong>Senior developer hourly rate:</strong> $75-150<br />
                    <strong>Average code review time:</strong> 2-3 hours per PR<br />
                    <strong>Time saved with AI:</strong> 50-70% reduction<br />
                    <strong>Monthly savings (20 PRs):</strong> $1,500-4,500<br />
                    <strong>App cost:</strong> $49-149/month<br />
                    <strong>Net monthly savings:</strong> $1,351-4,351
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900 mb-2">AI Cost Estimation</h4>
                  <p className="text-purple-800 text-sm">
                    <strong>Typical PR analysis cost:</strong> $0.05-0.20 per review<br />
                    <strong>Using GPT-4:</strong> ~$0.15 per PR (1,000 lines of code)<br />
                    <strong>Using Claude 3.5:</strong> ~$0.08 per PR (1,000 lines of code)<br />
                    <strong>Monthly AI costs (20 PRs):</strong> $1-4 with your own API keys
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">User Reviews</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-lg font-semibold">{appStats.rating}</span>
                <span className="text-gray-600">({appStats.reviews} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="font-semibold">{testimonial.name}</span>
                          <span className="text-gray-600 text-sm">{testimonial.role}</span>
                        </div>
                        <p className="text-gray-700">{testimonial.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Requests */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Popular Feature Requests</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>• Support for Rust and Go languages</span>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Integration with Jira for issue tracking</span>
                    <Badge variant="outline" className="text-xs">In Development</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Custom rule engine for team-specific guidelines</span>
                    <Badge variant="outline" className="text-xs">Q2 2024</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header with Back Button and Breadcrumbs */}
        <AppDetailNavigation 
          appName="Code Review Bot"
          categoryName="Developer Tools"
          categorySlug="DEVELOPER_TOOLS"
          onTryDemo={() => setActiveTab('demo')}
        />

        {/* App Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <div className="h-24 w-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Code2 className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">Code Review Bot</h1>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="outline">
                  <Github className="h-3 w-3 mr-1" />
                  GitHub Ready
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                Automated code review for security issues, performance optimizations, and style improvements. 
                Integrates with GitHub PRs and supports 20+ programming languages. 50% faster reviews.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{appStats.rating}</span>
                  <span>({appStats.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{appStats.installs} installs</span>
                </div>
                <div>by {appStats.developer}</div>
                <div>Updated {appStats.lastUpdated}</div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">🤖 GPT-4</Badge>
                <Badge variant="outline">🔮 Claude</Badge>
                <Badge variant="outline">GitHub</Badge>
                <Badge variant="outline">Security</Badge>
                <Badge variant="outline">Code Quality</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-purple-600">$49/month</div>
                <Button size="lg">
                  Install App
                </Button>
                <Button size="lg" variant="outline">
                  Try Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            {(['overview', 'demo', 'pricing', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </MainLayout>
  );
}