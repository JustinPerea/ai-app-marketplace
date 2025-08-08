'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { MissionControlLogo } from '@/components/ui/mission-control-logo';
import { NavigatorLogo } from '@/components/ui/navigator-logo';
// Removed ROI Calculator and Provider Flow - moved to dedicated pages
import { ArrowRight, Shield, Zap, BarChart3, Globe, Key, Code2, Star, Users, TrendingUp } from 'lucide-react';
import { ProviderLogo } from '@/components/ui/provider-logo';

// Dynamic stats calculation based on real platform data
function getDynamicStats() {
  // Based on actual provider configuration:
  // OpenAI: 5 models, Anthropic: 4 models, Google: 4 chat + 2 video = 6 models
  const totalProviders = 7; // OPENAI, ANTHROPIC, GOOGLE, AZURE_OPENAI, COHERE, HUGGING_FACE, OLLAMA
  const totalModels = 15; // 5 OpenAI + 4 Anthropic + 6 Google models
  
  return {
    // Row 1: Capability Stats
    capabilityStats: [
      { 
        value: "AI Providers", 
        label: "AI Providers", 
        animatedValue: totalProviders,
        showLogos: true,
        logos: [
          { name: "OpenAI (ChatGPT, GPT-4)", provider: "OPENAI", color: "#10A37F", url: "https://openai.com" },
          { name: "Anthropic (Claude)", provider: "ANTHROPIC", color: "#D4915D", url: "https://anthropic.com" },
          { name: "Google (Gemini)", provider: "GOOGLE", color: "#4285F4", url: "https://ai.google.dev" },
          { name: "4 more providers (Cohere, HuggingFace, Azure, Ollama)", text: "+4", color: "#8B5CF6", url: "/setup" }
        ]
      },
      { value: `${totalModels}+`, label: "AI Models", animatedValue: totalModels },
      { value: "Up to 80%", label: "Cost Savings", animatedValue: 80 }
    ],
    // Row 2: Platform Readiness
    readinessStats: [
      { value: "Ready SDK", label: "Developer Tools", animatedValue: 100 },
      { value: "Secure Connection", label: "Account Management", animatedValue: 100 },
      { value: "Growing", label: "Ecosystem", animatedValue: 100 }
    ]
  };
}

export default function Home() {
  const dynamicStats = getDynamicStats();
  const featuredApps: Array<{
    name: string;
    description: string;
    rating: number;
    installs: string;
    category: string;
    featured?: boolean;
    logo?: string;
  }> = [];

  return (
    <CosmicPageLayout starCount={50} parallaxSpeed={0.3} gradientOverlay="none">
      {/* Subtle Cosmic Background Gradient - Behind Stars */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
          zIndex: 0
        }}
      />
      
      {/* Hero Section - Glass Design System */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <div className="relative mr-3">
                {/* Nebula Swirl Background */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.4) 40%, rgba(255, 215, 0, 0.3) 70%, transparent 100%)',
                  width: '24px',
                  height: '24px',
                  transform: 'scale(1.2)'
                }} />
                {/* Navigator Fleet Icon */}
                <NavigatorLogo size={20} animated={false} className="relative z-10" />
              </div>
              <span className="text-sm font-medium text-text-primary">Your AI Universe</span>
            </div>
            <div className="relative z-10">
              <h1 className="text-hero-glass mb-6">
                <span className="text-cosmara-brand" style={{fontSize: '1.1em'}}>COSMARA</span>
                <br />
                <span className="text-stardust-gradient">All AI Tools, One Simple Platform</span>
              </h1>
            </div>
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Use the world's most powerful AI models for any task. One account, unlimited possibilities.
            </p>
            
            {/* Cosmic User Paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto md:h-96">
              {/* Mission Control Card */}
              <div className="glass-card p-8 group hover:scale-105 transition-transform flex flex-col h-full">
                {/* Unified responsive layout */}
                <div className="flex flex-col md:flex-row items-center md:items-center text-center md:text-left md:gap-6 flex-1">
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <MissionControlLogo size={72} animated={true} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h2 mb-3 md:mb-3 text-text-primary">Launch Your AI Mission</h3>
                    <p className="text-body-glass leading-relaxed">
                      Don't worry about connecting your accounts - we handle the setup so you can focus on using AI apps
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
                {/* Unified responsive layout */}
                <div className="flex flex-col md:flex-row items-center md:items-center text-center md:text-left md:gap-6 flex-1">
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <NavigatorLogo size={72} animated={true} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h2 mb-3 md:mb-3 text-text-primary">Navigate with Your Own Fleet</h3>
                    <p className="text-body-glass leading-relaxed">
                      Use your own accounts for maximum privacy, cost savings, and direct control over your AI usage
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

            {/* Two-Row Dynamic Stats Display - Glass Morphism Panels */}
            <div className="mt-16 space-y-8">
              {/* Row 1: Capability Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
                {dynamicStats.capabilityStats.map((stat, index) => (
                  <div key={`capability-${index}`} className="glass-card p-4 text-center hover:scale-105 transition-transform">
                    {stat.showLogos ? (
                      <div>
                        {/* Company Logo Row */}
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          {stat.logos.map((logo, logoIndex) => (
                            <a
                              key={logoIndex}
                              href={logo.url}
                              target={logo.url.startsWith('http') ? '_blank' : '_self'}
                              rel={logo.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${logo.color}20, ${logo.color}10)`,
                                border: `1px solid ${logo.color}30`,
                                color: logo.color
                              }}
                              title={`Visit ${logo.name}`}
                              aria-label={`Visit ${logo.name}`}
                            >
                              {logo.provider ? (
                                <ProviderLogo provider={logo.provider} size={24} />
                              ) : (
                                logo.text
                              )}
                            </a>
                          ))}
                        </div>
                        <div className="text-xs md:text-sm text-text-secondary">{stat.label}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-text-primary">{stat.value}</div>
                        <div className="text-xs md:text-sm text-text-secondary">{stat.label}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Row 2: Platform Readiness */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
                {dynamicStats.readinessStats.map((stat, index) => (
                  <div key={`readiness-${index}`} className="glass-card p-4 text-center hover:scale-105 transition-transform">
                    <div className="text-base md:text-lg font-semibold text-cosmara-brand">{stat.value}</div>
                    <div className="text-xs md:text-sm text-text-secondary">{stat.label}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Link href="/setup" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                     boxShadow: '0 0 0 rgba(59, 130, 246, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-blue-500/50">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary group-hover:text-blue-300 transition-colors">Your Keys, Your Control</h3>
              <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                Your own keys, your own control. Navigate AI providers with complete security and data ownership.
              </p>
            </Link>
            
            <Link href="/marketplace" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #FFD700, #FF6B35)',
                     boxShadow: '0 0 0 rgba(255, 215, 0, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-yellow-500/50">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary group-hover:text-yellow-300 transition-colors">Access All AI Tools</h3>
              <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                Connect to the complete AI ecosystem. ChatGPT, Claude, Gemini, and beyond - all in one platform.
              </p>
            </Link>
            
            <Link href="/dashboard/analytics" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                     boxShadow: '0 0 0 rgba(139, 92, 246, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary">Intelligent Analytics</h3>
              <p className="text-body-glass">
                Map your AI usage journey. Track patterns, optimize costs, and discover new efficiency opportunities.
              </p>
            </Link>

            <Link href="/setup" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #FF6B35, #8B5CF6)',
                     boxShadow: '0 0 0 rgba(255, 107, 53, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-orange-500/50">
                <Key className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary group-hover:text-orange-300 transition-colors">Account Management</h3>
              <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                Securely manage your AI accounts with enterprise-grade security and automated connection management.
              </p>
            </Link>

            <Link href="/developers/getting-started" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                     boxShadow: '0 0 0 rgba(139, 92, 246, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-purple-500/50">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary group-hover:text-purple-300 transition-colors">Developer Ecosystem</h3>
              <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                Join thousands of developers building and monetizing AI applications in our thriving ecosystem.
              </p>
            </Link>

            <Link href="/business" className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                   style={{ 
                     background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                     boxShadow: '0 0 0 rgba(59, 130, 246, 0.3)',
                     transition: 'box-shadow 0.3s ease'
                   }}
                   className="group-hover:shadow-cyan-500/50">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-h3 mb-3 text-text-primary group-hover:text-cyan-300 transition-colors">Cost Optimization</h3>
              <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                Save up to 80% compared to individual subscriptions with our intelligent routing and usage optimization features.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Apps Section - Render only when data is available */}
      {featuredApps.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-section-header">Featured AI Applications</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                Discover popular AI applications built by our developer community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredApps.map((app, index) => (
                <div key={index} className="glass-card p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }} />
                      <div className="flex-1">
                        <h3 className="text-h3 mb-2 text-text-primary">{app.name}</h3>
                        <div className="glass-base px-3 py-1 rounded-full border inline-flex items-center mb-3" 
                             style={{ 
                               background: 'rgba(59, 130, 246, 0.1)',
                               borderColor: '#3B82F6'
                             }}>
                          <span className="text-sm font-medium text-text-primary">{app.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-body-glass mb-6 leading-relaxed">{app.description}</p>
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
                      Explore
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
      )}


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
                  <Link href="/developers/docs" className="flex items-center space-x-2">
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