'use client';

import { useState } from 'react';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Calculator,
  Star,
  Crown,
  Rocket,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export default function RevenuePage() {
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const revenueModels = [
    {
      id: 'freemium',
      name: 'Freemium',
      description: 'Free app with premium features',
      potential: '$500-2K/month',
      difficulty: 'Easy',
      timeToRevenue: '1-2 months',
      examples: ['Basic AI chat with premium models', 'Limited document processing']
    },
    {
      id: 'premium',
      name: 'Premium Apps',
      description: 'Paid apps with advanced features',
      potential: '$2K-10K/month',
      difficulty: 'Medium',
      timeToRevenue: '2-4 months',
      examples: ['Professional AI assistants', 'Industry-specific tools']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Solutions',
      description: 'Custom solutions for businesses',
      potential: '$10K-50K/month',
      difficulty: 'Hard',
      timeToRevenue: '3-6 months',
      examples: ['Custom AI workflows', 'White-label solutions']
    }
  ];

  const revenueStreams = [
    {
      name: 'App Sales',
      description: 'Direct app purchases',
      percentage: '40%',
      color: 'bg-blue-500'
    },
    {
      name: 'Subscriptions',
      description: 'Monthly/yearly subscriptions',
      percentage: '35%',
      color: 'bg-green-500'
    },
    {
      name: 'Usage-Based',
      description: 'Pay-per-use models',
      percentage: '15%',
      color: 'bg-purple-500'
    },
    {
      name: 'Enterprise Licensing',
      description: 'Custom enterprise deals',
      percentage: '10%',
      color: 'bg-yellow-500'
    }
  ];

  const successStories = [
    {
      name: 'AI Content Studio',
      developer: 'Sarah Chen',
      revenue: '$8.5K/month',
      category: 'Content Creation',
      users: '2.1K',
      growth: '+125%'
    },
    {
      name: 'Legal Assistant Pro',
      developer: 'Marcus Johnson',
      revenue: '$15.2K/month',
      category: 'Legal Tech',
      users: '450',
      growth: '+89%'
    },
    {
      name: 'Code Review Bot',
      developer: 'Alex Rodriguez',
      revenue: '$12.8K/month',
      category: 'Developer Tools',
      users: '850',
      growth: '+156%'
    }
  ];

  return (
    <CosmicPageLayout gradientOverlay="green">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <CosmicPageHeader 
          icon={DollarSign}
          title="Revenue Opportunities"
          subtitle="Turn your AI applications into profitable businesses. Learn about monetization strategies, revenue models, and success stories from our thriving developer community."
          accentIcon={TrendingUp}
        />

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <CosmicCard variant="glass" className="text-center">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-400 mb-2">$2.8M+</div>
              <div className="text-gray-300">Total Developer Revenue</div>
            </CardContent>
          </CosmicCard>
          <CosmicCard variant="glass" className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-400 mb-2">450+</div>
              <div className="text-gray-300">Earning Developers</div>
            </CardContent>
          </CosmicCard>
          <CosmicCard variant="glass" className="text-center">
            <CardContent className="p-6">
              <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-400 mb-2">$6.2K</div>
              <div className="text-gray-300">Average Monthly Revenue</div>
            </CardContent>
          </CosmicCard>
          <CosmicCard variant="glass" className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-400 mb-2">185%</div>
              <div className="text-gray-300">Average Growth Rate</div>
            </CardContent>
          </CosmicCard>
        </div>

        {/* Revenue Models */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Revenue Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {revenueModels.map((model) => (
                <Card 
                  key={model.id}
                  className={`bg-black/20 backdrop-blur-sm border-gray-700 cursor-pointer transition-all duration-300 ${
                    selectedPlan === model.id ? 'ring-2 ring-blue-400 bg-blue-500/10' : 'hover:bg-black/30'
                  }`}
                  onClick={() => setSelectedPlan(model.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{model.name}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={
                          model.difficulty === 'Easy' ? 'bg-green-600' :
                          model.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                        }
                      >
                        {model.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Potential Revenue:</span>
                      <span className="text-green-400 font-semibold">{model.potential}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Time to Revenue:</span>
                      <span className="text-blue-400 font-semibold">{model.timeToRevenue}</span>
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm mb-2">Examples:</div>
                      <ul className="space-y-1">
                        {model.examples.map((example, index) => (
                          <li key={index} className="text-gray-400 text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Revenue Streams Breakdown */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Revenue Streams</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-6 w-6 text-purple-400" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revenueStreams.map((stream, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{stream.name}</span>
                        <span className="text-gray-300">{stream.percentage}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${stream.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: stream.percentage }}
                        />
                      </div>
                      <p className="text-gray-400 text-sm">{stream.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-green-400" />
                    Revenue Calculator
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Estimate your potential monthly revenue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">App Category</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
                      <option>Content Creation</option>
                      <option>Developer Tools</option>
                      <option>Business Automation</option>
                      <option>Data Analysis</option>
                      <option>Creative Design</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Pricing Model</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
                      <option>Freemium</option>
                      <option>One-time Purchase</option>
                      <option>Monthly Subscription</option>
                      <option>Usage-based</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Expected Users</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
                      <option>100-500</option>
                      <option>500-1K</option>
                      <option>1K-5K</option>
                      <option>5K+</option>
                    </select>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-green-400 font-semibold">Estimated Revenue</div>
                    <div className="text-2xl font-bold text-green-400">$3,200 - $8,500/month</div>
                    <div className="text-gray-400 text-sm mt-1">Based on similar apps in your category</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Success Stories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story, index) => (
                <Card key={index} className="bg-black/20 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Crown className="h-6 w-6 text-yellow-400" />
                      <Badge variant="secondary" className="bg-green-600">
                        {story.growth}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{story.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      by {story.developer} • {story.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Revenue:</span>
                      <span className="text-green-400 font-bold">{story.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Users:</span>
                      <span className="text-blue-400 font-semibold">{story.users}</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Case Study
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Monetization Tips */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Monetization Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-400" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Start with value</div>
                      <div className="text-gray-400 text-sm">Solve a real problem before thinking about pricing</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Test pricing models</div>
                      <div className="text-gray-400 text-sm">A/B test different pricing strategies</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Focus on retention</div>
                      <div className="text-gray-400 text-sm">Happy users become paying customers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Optimize for mobile</div>
                      <div className="text-gray-400 text-sm">60% of users access apps on mobile</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-red-400" />
                    Common Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <div>
                      <div className="text-white font-medium">Pricing too low</div>
                      <div className="text-gray-400 text-sm">Undervaluing your work hurts long-term growth</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <div>
                      <div className="text-white font-medium">Ignoring user feedback</div>
                      <div className="text-gray-400 text-sm">User insights drive successful monetization</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <div>
                      <div className="text-white font-medium">Feature creep</div>
                      <div className="text-gray-400 text-sm">Too many features can confuse users</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <div>
                      <div className="text-white font-medium">No marketing plan</div>
                      <div className="text-gray-400 text-sm">Great apps need great marketing</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Get Started */}
          <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                <Rocket className="h-6 w-6 text-blue-400" />
                Start Earning Today
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Ready to turn your AI app ideas into revenue?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="/developers/quick-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Build Your First App
                  </a>
                </Button>
                <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black" asChild>
                  <a href="/developers/roi-calculator">
                    <Calculator className="h-4 w-4 mr-2" />
                    ROI Calculator
                  </a>
                </Button>
                <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black" asChild>
                  <a href="/developers/examples">
                    <Star className="h-4 w-4 mr-2" />
                    View Examples
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CosmicPageLayout>
  );
}