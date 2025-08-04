import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { MissionControlLogo } from '@/components/ui/mission-control-logo';
import { NavigatorLogo } from '@/components/ui/navigator-logo';
// Removed ROI Calculator and Provider Flow - moved to dedicated pages
import { ArrowRight, Shield, Zap, BarChart3, Globe, Key, Code2, Star, Users, TrendingUp } from 'lucide-react';

// Dynamic stats calculation based on real platform data
function getDynamicStats() {
  // Based on actual provider configuration:
  // OpenAI: 5 models, Anthropic: 4 models, Google: 4 chat + 2 video = 6 models
  const totalProviders = 7; // OPENAI, ANTHROPIC, GOOGLE, AZURE_OPENAI, COHERE, HUGGING_FACE, OLLAMA
  const totalModels = 15; // 5 OpenAI + 4 Anthropic + 6 Google models
  
  return {
    // Row 1: Capability Stats
    capabilityStats: [
      { value: `${totalProviders}+`, label: "AI Providers", animatedValue: totalProviders },
      { value: `${totalModels}+`, label: "AI Models", animatedValue: totalModels },
      { value: "Up to 80%", label: "Cost Savings", animatedValue: 80 }
    ],
    // Row 2: Platform Readiness
    readinessStats: [
      { value: "Ready SDK", label: "Developer Tools", animatedValue: 100 },
      { value: "Secure BYOK", label: "Key Management", animatedValue: 100 },
      { value: "Growing", label: "Ecosystem", animatedValue: 100 }
    ]
  };
}

export default function Home() {
  const dynamicStats = getDynamicStats();

  return (
    <CosmicPageLayout starCount={50} parallaxSpeed={0.3} gradientOverlay="none">
      {/* Hero Section - Glass Design System */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <Zap className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium text-text-primary">Your AI Universe</span>
            </div>
            <div className="relative z-10">
              <h1 className="text-hero-glass mb-6">
                <span className="text-stardust-muted">Welcome to</span>
                <br />
                <span className="text-cosmara-brand">COSMARA</span>
              </h1>
            </div>
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Navigate the infinite possibilities of AI with your own keys. 
              Discover, deploy, and manage applications in your personal AI marketplace.
            </p>
            
            {/* Cosmic User Paths */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto md:h-96">
              {/* Mission Control Card */}
              <div className="glass-card p-8 group hover:scale-105 transition-transform flex flex-col h-full">
                {/* Mobile: Centered vertical layout */}
                <div className="flex flex-col items-center text-center md:hidden flex-1">
                  <div className="mb-4">
                    <MissionControlLogo size={72} animated={true} />
                  </div>
                  <h3 className="text-h2 mb-4 text-text-primary">Launch Your AI Mission</h3>
                  <p className="text-body-glass mb-6 leading-relaxed flex-1">
                    Don't worry about getting multiple API keys - we handle the setup so you can focus on using AI apps
                  </p>
                </div>
                
                {/* Desktop/Tablet: Horizontal layout */}
                <div className="hidden md:flex md:items-center md:gap-6 flex-1">
                  <div className="flex-shrink-0">
                    <MissionControlLogo size={72} animated={true} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h2 mb-3 text-text-primary">Launch Your AI Mission</h3>
                    <p className="text-body-glass leading-relaxed">
                      Don't worry about getting multiple API keys - we handle the setup so you can focus on using AI apps
                    </p>
                  </div>
                </div>
                
                <button className="w-full mt-6 px-8 py-4 flex items-center justify-center space-x-2 rounded-xl font-medium transition-all duration-300 hover:scale-105" 
                        style={{ 
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                        }}>
                  <Link href="/marketplace" className="flex items-center space-x-2">
                    <span>Explore AI Universe</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </button>
              </div>

              {/* Navigator Mode Card */}
              <div className="glass-card p-8 group hover:scale-105 transition-transform flex flex-col h-full">
                {/* Mobile: Centered vertical layout */}
                <div className="flex flex-col items-center text-center md:hidden flex-1">
                  <div className="mb-4">
                    <NavigatorLogo size={72} animated={true} />
                  </div>
                  <h3 className="text-h2 mb-4 text-text-primary">Navigate with Your Own Fleet</h3>
                  <p className="text-body-glass mb-6 leading-relaxed flex-1">
                    Use your own API keys for maximum privacy, cost savings, and direct control over your AI usage
                  </p>
                </div>
                
                {/* Desktop/Tablet: Horizontal layout */}
                <div className="hidden md:flex md:items-center md:gap-6 flex-1">
                  <div className="flex-shrink-0">
                    <NavigatorLogo size={72} animated={true} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h2 mb-3 text-text-primary">Navigate with Your Own Fleet</h3>
                    <p className="text-body-glass leading-relaxed">
                      Use your own API keys for maximum privacy, cost savings, and direct control over your AI usage
                    </p>
                  </div>
                </div>
                
                <button className="w-full mt-6 px-8 py-4 flex items-center justify-center space-x-2 rounded-xl font-medium transition-all duration-300 hover:scale-105" 
                        style={{ 
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                        }}>
                  <Link href="/setup" className="flex items-center space-x-2">
                    <span>Connect Your Fleet</span>
                    <Key className="h-5 w-5" />
                  </Link>
                </button>
              </div>
            </div>

            {/* Two-Row Dynamic Stats Display */}
            <div className="mt-16 space-y-8">
              {/* Row 1: Capability Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {dynamicStats.capabilityStats.map((stat, index) => (
                  <div key={`capability-${index}`} className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Row 2: Platform Readiness */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {dynamicStats.readinessStats.map((stat, index) => (
                  <div key={`readiness-${index}`} className="text-center">
                    <div className="text-lg font-semibold text-cosmara-brand">{stat.value}</div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Glass Design */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header">
              Why Navigate with <span className="text-cosmara-brand">Cosmara</span>?
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Chart your course through AI innovation with complete control and unlimited possibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Your Keys, Your Control</h3>
              <p className="text-body-glass">
                Your own keys, your own control. Navigate AI providers with complete security and data ownership.
              </p>
            </div>
            
            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B35)' }}>
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Universal AI Access</h3>
              <p className="text-body-glass">
                Connect to the complete AI ecosystem. OpenAI, Anthropic, Google AI, and beyond - all in one platform.
              </p>
            </div>
            
            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Intelligent Analytics</h3>
              <p className="text-body-glass">
                Map your AI usage journey. Track patterns, optimize costs, and discover new efficiency opportunities.
              </p>
            </div>

            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #FF6B35, #8B5CF6)' }}>
                <Key className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">API Key Management</h3>
              <p className="text-body-glass">
                Securely manage your API keys with envelope encryption and enterprise-grade key rotation.
              </p>
            </div>

            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #8B5CF6, #A855F7)' }}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Developer Ecosystem</h3>
              <p className="text-body-glass">
                Join thousands of developers building and monetizing AI applications in our thriving ecosystem.
              </p>
            </div>

            <div className="glass-card p-6 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Cost Optimization</h3>
              <p className="text-body-glass">
                Save up to 40% on AI costs with our intelligent routing and usage optimization features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Navigation */}
      <section className="py-20 relative">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              Choose Your Path
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Whether you're exploring AI possibilities or building the next generation of AI applications, we have the right tools for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* General Users */}
            <Card className="glass-card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
                   style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h2 mb-4 text-text-primary">I'm Exploring AI</h3>
              <p className="text-body-glass mb-6 leading-relaxed">
                Discover how AI can transform your work with our curated marketplace of applications. 
                No technical knowledge required.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Your own API keys</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Easy setup & management</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>Cost-effective solutions</span>
                </div>
              </div>
              <button className="w-full mb-4 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2" 
                      style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                      }}>
                <Link href="/marketplace" className="flex items-center space-x-2">
                  <span>Explore AI Apps</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </button>
              <button className="w-full px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2" 
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}>
                <Link href="/business" className="flex items-center space-x-2">
                  <span>Calculate Business ROI</span>
                  <BarChart3 className="h-4 w-4" />
                </Link>
              </button>
            </Card>

            {/* Developers */}
            <Card className="glass-card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
                   style={{ background: 'linear-gradient(135deg, #FF6B35, #8B5CF6)' }}>
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h2 mb-4 text-text-primary">I'm Building with AI</h3>
              <p className="text-body-glass mb-6 leading-relaxed">
                Access our developer platform with multi-provider orchestration, SDKs, and tools to build the next generation of AI applications.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <Globe className="h-4 w-4 text-orange-500" />
                  <span>Multi-provider SDK</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <Key className="h-4 w-4 text-green-500" />
                  <span>Advanced API management</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Cost optimization tools</span>
                </div>
              </div>
              <button className="w-full mb-4 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2" 
                      style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                      }}>
                <Link href="/developers" className="flex items-center space-x-2">
                  <span>Developer Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </button>
              <button className="w-full px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2" 
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}>
                <Link href="/ai-guide" className="flex items-center space-x-2">
                  <span>Technical Guide</span>
                  <Shield className="h-4 w-4" />
                </Link>
              </button>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Apps Section - Glass Design */}
      <section className="py-20 relative">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-section-header">
              Featured AI Applications
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Discover popular AI applications built by our developer community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Smart Content Generator",
                description: "Generate high-quality content for blogs, social media, and marketing campaigns.",
                rating: 4.8,
                installs: "5.2K",
                category: "Content Creation",
                featured: true
              },
              {
                name: "Code Assistant Pro",
                description: "AI-powered code completion, debugging, and optimization for developers.",
                rating: 4.9,
                installs: "12.1K",
                category: "Development",
                featured: true
              },
              {
                name: "Data Insights Engine",
                description: "Analyze and visualize complex datasets with natural language queries.",
                rating: 4.7,
                installs: "3.8K",
                category: "Analytics",
                featured: false
              }
            ].map((app, index) => (
              <div key={index} className="glass-card p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-h3 mb-2 text-text-primary">{app.name}</h3>
                    <div className="glass-base px-3 py-1 rounded-full border inline-flex items-center mb-3" 
                         style={{ 
                           background: app.featured ? 'rgba(255, 215, 0, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                           borderColor: app.featured ? '#FFD700' : '#3B82F6'
                         }}>
                      <span className="text-sm font-medium text-text-primary">{app.category}</span>
                    </div>
                  </div>
                  {app.featured && (
                    <div className="glass-base px-3 py-1 rounded-full border inline-flex items-center" 
                         style={{ 
                           background: 'rgba(255, 215, 0, 0.1)',
                           borderColor: 'rgba(255, 215, 0, 0.4)'
                         }}>
                      <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Featured</span>
                    </div>
                  )}
                </div>
                <p className="text-body-glass mb-6 leading-relaxed">
                  {app.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-text-primary">{app.rating}</span>
                    <span className="text-sm text-text-muted">({app.installs} installs)</span>
                  </div>
                  <button className="px-4 py-2 text-sm group-hover:scale-105 transition-transform rounded-lg font-medium border-2" 
                          style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderColor: '#3B82F6',
                            color: '#3B82F6'
                          }}>
                    Install
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="text-lg px-8 py-4 flex items-center justify-center space-x-2 mx-auto rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105" 
                    style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderColor: '#3B82F6',
                      color: '#3B82F6'
                    }}>
              <Link href="/marketplace" className="flex items-center space-x-2">
                <span>View All Applications</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* Developer CTA - Glass Design */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            
            <div className="relative z-10">
              <h2 className="text-hero-glass mb-6">
                Ready to Build the Future?
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
                Join our developer community and start publishing your AI applications today. 
                Benefit from our 0% commission on your first $100K in revenue.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="text-lg px-8 py-6 flex items-center justify-center space-x-2 rounded-xl font-medium transition-all duration-300 hover:scale-105" 
                        style={{ 
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                        }}>
                  <Link href="/developers/getting-started" className="flex items-center space-x-2">
                    <span>Developer Portal</span>
                    <Code2 className="h-5 w-5" />
                  </Link>
                </button>
                <button className="text-lg px-8 py-6 flex items-center justify-center space-x-2 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105" 
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          borderColor: '#3B82F6',
                          color: '#3B82F6'
                        }}>
                  <Link href="/docs" className="flex items-center space-x-2">
                    <span>View Documentation</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CosmicPageLayout>
  );
}