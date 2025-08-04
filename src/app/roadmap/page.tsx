'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleStars } from '@/components/ui/simple-stars';
import Link from 'next/link';
import React, { useState } from 'react';
import { 
  Map, 
  Calendar,
  Target,
  Rocket,
  Code2,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Star,
  GitBranch,
  Package,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';

export default function RoadmapPage() {
  // State for interactive cosmic journey
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  // Galaxy types for cosmic journey visualization
  const galaxyTypes = {
    1: 'spiral',      // Foundation - Spiral galaxy (structured, foundational)
    2: 'nebula',      // API Compatibility - Nebula (expanding, colorful)
    2.5: 'cluster',   // SDK Protection - Star cluster (organized, protective)
    3: 'elliptical',  // Advanced Features - Elliptical galaxy (mature, feature-rich)
    4: 'irregular',   // Enterprise - Irregular galaxy (flexible, adaptive)
    5: 'starburst'    // Marketplace - Starburst galaxy (active, growing)
  };

  const phases = [
    {
      id: 1,
      title: "Foundation & Core SDK",
      timeline: "July 2025",
      status: "completed",
      developers: "5,000+ developers",
      apps: "100+ apps built",
      icon: Package,
      color: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      iconColor: "#22C55E",
      milestones: [
        { title: "Zero-Dependency Architecture", status: "completed", week: "✅ Complete" },
        { title: "Native OpenAI Provider (100% Compatible)", status: "completed", week: "✅ Complete" },
        { title: "Native Anthropic/Claude Provider", status: "completed", week: "✅ Complete" },
        { title: "Native Google Gemini Provider", status: "completed", week: "✅ Complete" },
        { title: "Ultra-Lightweight Bundle (4x Smaller)", status: "completed", week: "✅ Complete" },
        { title: "Production-Ready Quality Assurance", status: "completed", week: "✅ Complete" },
        { title: "Tree-Shakable Architecture", status: "completed", week: "✅ Complete" },
        { title: "Enhanced OpenAI API Compatibility", status: "completed", week: "✅ Complete" }
      ],
      targets: [
        "✅ Bundle Size: 25-30KB per provider (4x smaller than alternatives)",
        "✅ Zero Dependencies: Eliminated 263KB+ of dependencies",
        "✅ Perfect OpenAI Compatibility: Drop-in replacement capability",
        "✅ Tree-Shaking Support: Include only what you need",
        "✅ Production Ready: Extensively tested and validated"
      ]
    },
    {
      id: 2,
      title: "API Compatibility & Provider Expansion",
      timeline: "Late July 2025",
      status: "completed",
      developers: "15,000+ developers",
      apps: "500+ apps built",
      icon: GitBranch,
      color: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.3)",
      iconColor: "#3B82F6",
      milestones: [
        { title: "OpenAI-Compatible REST API", status: "completed", week: "✅ Complete" },
        { title: "Server-Sent Events (SSE) Streaming", status: "completed", week: "✅ Complete" },
        { title: "Enterprise Team Management", status: "completed", week: "✅ Complete" },
        { title: "Extended Provider Support", status: "completed", week: "✅ Complete" },
        { title: "Intelligent A/B Testing Framework", status: "completed", week: "✅ Complete" },
        { title: "Advanced Billing & Usage Analytics", status: "completed", week: "✅ Complete" },
        { title: "Framework Integrations (LangChain, LlamaIndex)", status: "completed", week: "✅ Complete" }
      ],
      targets: [
        "✅ 100% OpenAI-Compatible REST API for seamless migration",
        "✅ 6+ AI providers with 24+ models available",
        "✅ Enterprise features: team management, billing, governance",
        "✅ Popular framework support: LangChain, LlamaIndex, and more",
        "✅ Smart A/B testing with 33%+ cost optimization"
      ]
    },
    {
      id: 2.5,
      title: "SDK Protection & Developer Tools",
      timeline: "August 3, 2025",
      status: "completed",
      developers: "10,000+ free tier users",
      apps: "200+ community apps",
      icon: Settings,
      color: "rgba(139, 92, 246, 0.1)",
      borderColor: "rgba(139, 92, 246, 0.3)",
      iconColor: "#8B5CF6",
      milestones: [
        { title: "Free Community Tier (1,000 requests/month)", status: "completed", week: "✅ Complete" },
        { title: "Enhanced Developer SDK with Advanced Features", status: "completed", week: "✅ Complete" },
        { title: "Enterprise SDK with Full Feature Set", status: "completed", week: "✅ Complete" },
        { title: "ROI Calculator with Real Benchmarks", status: "completed", week: "✅ Complete" },
        { title: "Developer Portal at cosmara.dev", status: "completed", week: "✅ Complete" },
        { title: "Optimized Developer Onboarding Experience", status: "completed", week: "✅ Complete" }
      ],
      targets: [
        "✅ Free tier: 1,000 monthly requests for all developers",
        "✅ Seamless SDK integration across all environments",
        "✅ Real-time performance benchmarks and cost analysis",
        "✅ Professional developer portal and documentation",
        "✅ Streamlined onboarding and developer journey"
      ]
    },
    {
      id: 3,
      title: "Advanced Features & Platform Enhancement",
      timeline: "August 2025 - October 2025",
      status: "ready-to-start",
      developers: "30,000+ developers",
      apps: "1,000+ apps in marketplace",
      icon: Rocket,
      color: "rgba(255, 215, 0, 0.1)",
      borderColor: "rgba(255, 215, 0, 0.3)",
      iconColor: "#FFD700",
      milestones: [
        { title: "Multi-Modal AI Support (Images, Audio, Video)", status: "roadmapped", week: "August 2025" },
        { title: "Advanced Function/Tool Execution Framework", status: "roadmapped", week: "September 2025" },
        { title: "Distributed Caching & Performance Optimization", status: "roadmapped", week: "September 2025" },
        { title: "AI App Discovery & Recommendation Engine", status: "roadmapped", week: "October 2025" },
        { title: "Real-time Analytics & Monitoring Dashboard", status: "roadmapped", week: "October 2025" },
        { title: "Enhanced Security & Privacy Controls", status: "roadmapped", week: "October 2025" }
      ],
      targets: [
        "Multi-modal capabilities across all supported providers",
        "Sub-100ms average response times with caching",
        "Advanced function calling and tool execution",
        "Intelligent app discovery and recommendations",
        "Comprehensive analytics and performance monitoring"
      ]
    },
    {
      id: 4,
      title: "Enterprise Features & Team Collaboration",
      timeline: "October 2025 - December 2025",
      status: "planned",
      developers: "50,000+ developers",
      apps: "2,500+ apps in ecosystem",
      icon: Building2,
      color: "rgba(168, 85, 247, 0.1)",
      borderColor: "rgba(168, 85, 247, 0.3)",
      iconColor: "#A855F7",
      milestones: [
        { title: "Advanced Team Collaboration Tools", status: "planned", week: "October 2025" },
        { title: "Enterprise SSO & Identity Management", status: "planned", week: "October 2025" },
        { title: "Custom Model Fine-tuning Support", status: "planned", week: "November 2025" },
        { title: "Advanced Governance & Compliance Tools", status: "planned", week: "November 2025" },
        { title: "White-label Solutions & Custom Branding", status: "planned", week: "December 2025" },
        { title: "Enterprise SLA & Premium Support", status: "planned", week: "December 2025" }
      ],
      targets: [
        "Enterprise-grade team collaboration and project management",
        "SSO integration with major identity providers",
        "Custom model training and fine-tuning capabilities",
        "Advanced compliance tools for regulated industries",
        "White-label solutions for enterprise customers"
      ]
    },
    {
      id: 5,
      title: "Marketplace Expansion & Community Growth",
      timeline: "Q1 2026 and beyond",
      status: "planned",
      developers: "100,000+ developers",
      apps: "10,000+ apps in marketplace",
      icon: Users,
      color: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      iconColor: "#22C55E",
      milestones: [
        { title: "AI App Marketplace with Revenue Sharing", status: "planned", week: "Q1 2026" },
        { title: "Community Challenges & Developer Rewards", status: "planned", week: "Q1 2026" },
        { title: "Open Source Community Contributions", status: "planned", week: "Q2 2026" },
        { title: "Global Developer Conference & Events", status: "planned", week: "Q2 2026" },
        { title: "Educational Programs & Certification", status: "planned", week: "Q3 2026" },
        { title: "International Expansion & Localization", status: "planned", week: "Q3 2026" }
      ],
      targets: [
        "Thriving marketplace with thousands of AI applications",
        "Active developer community with regular contributions",
        "Global reach with localized documentation and support",
        "Educational programs helping developers master AI development",
        "Sustainable revenue sharing model for app creators"
      ]
    }
  ];

  const competitiveAdvantages = [
    {
      title: "Lightning Fast Performance",
      description: "Ultra-lightweight 25-30KB bundles with zero dependencies",
      advantage: "4x smaller bundles",
      icon: Zap,
      color: "#3B82F6"
    },
    {
      title: "Seamless Migration", 
      description: "100% OpenAI API compatibility - migrate in minutes",
      advantage: "Zero code changes",
      icon: Code2,
      color: "#8B5CF6"
    },
    {
      title: "Multi-Provider Freedom",
      description: "Switch between 6+ AI providers with a single SDK",
      advantage: "Vendor freedom",
      icon: GitBranch,
      color: "#FFD700"
    },
    {
      title: "Developer First",
      description: "Free tier, excellent docs, and active community support",
      advantage: "Built for developers",
      icon: Users,
      color: "#22C55E"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">COMPLETED</Badge>;
      case 'ready-to-start':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Ready to Start</Badge>;
      case 'planned':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Planned</Badge>;
      case 'roadmapped':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Roadmapped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'planned':
        return <Calendar className="h-4 w-4 text-purple-400" />;
      case 'roadmapped':
        return <Map className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Galaxy Component for Cosmic Journey
  const GalaxyPhase = ({ phase, index }: { phase: any; index: number }) => {
    const Icon = phase.icon;
    const galaxyType = galaxyTypes[phase.id as keyof typeof galaxyTypes];
    const isHovered = hoveredPhase === phase.id;
    const isCompleted = phase.status === 'completed';
    const isInProgress = phase.status === 'in-progress';
    const isReadyToStart = phase.status === 'ready-to-start';
    
    return (
      <div 
        className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-background rounded-full"
        onMouseEnter={() => setHoveredPhase(phase.id)}
        onMouseLeave={() => setHoveredPhase(null)}
        onClick={() => setSelectedPhase(phase.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedPhase(phase.id);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Explore Phase ${phase.id}: ${phase.title} - ${phase.status}`}
        aria-expanded={selectedPhase === phase.id}
      >
        {/* Galaxy Background */}
        <div 
          className={`
            relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full 
            transition-all duration-500 ease-out
            ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100'}
            ${isCompleted ? 'opacity-100' : isInProgress ? 'opacity-90' : isReadyToStart ? 'opacity-85' : 'opacity-70'}
          `}
          style={{
            background: phase.color,
            border: `2px solid ${phase.borderColor}`,
            boxShadow: isHovered 
              ? `0 0 40px ${phase.iconColor}40, inset 0 0 60px ${phase.iconColor}20`
              : `0 0 20px ${phase.iconColor}20, inset 0 0 40px ${phase.iconColor}10`,
          }}
        >
          {/* Galaxy Pattern Based on Type */}
          <div className={`absolute inset-0 rounded-full overflow-hidden ${getGalaxyPattern(galaxyType)}`}>
            {/* Central Core */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${phase.iconColor}40, ${phase.iconColor}20)`,
                border: `1px solid ${phase.iconColor}60`
              }}
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10" style={{ color: phase.iconColor }} />
            </div>

            {/* Animated Stars/Particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white rounded-full animate-pulse`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Status Indicator */}
          <div className="absolute -top-2 -right-2">
            {isCompleted && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
            {isInProgress && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                <Clock className="h-4 w-4 text-white" />
              </div>
            )}
            {isReadyToStart && (
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-background">
                <Target className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Phase Info on Hover */}
        {isHovered && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="glass-card px-4 py-2 rounded-lg text-center whitespace-nowrap">
              <p className="text-sm font-medium text-text-primary">Phase {phase.id}</p>
              <p className="text-xs text-text-secondary">{phase.title}</p>
              <div className="mt-1">
                {getStatusBadge(phase.status)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get galaxy pattern CSS classes based on type
  const getGalaxyPattern = (type: string) => {
    switch (type) {
      case 'spiral':
        return 'galaxy-spiral';
      case 'nebula':
        return 'galaxy-nebula';
      case 'cluster':
        return 'galaxy-cluster';
      case 'elliptical':
        return 'galaxy-elliptical';
      case 'irregular':
        return 'galaxy-irregular';
      case 'starburst':
        return 'galaxy-starburst';
      default:
        return 'galaxy-spiral';
    }
  };

  // Rocket Progress Indicator
  const RocketIndicator = () => {
    // Find current progress position (between last completed and current phase)
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalPhases = phases.length;
    const progressPercentage = (completedPhases / totalPhases) * 100;

    return (
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 z-20 transition-all duration-1000 ease-out"
        style={{ left: `${Math.min(progressPercentage, 85)}%` }}
      >
        <div className="relative">
          {/* Rocket */}
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
            <Rocket className="h-6 w-6 md:h-8 md:w-8 text-white transform rotate-45" />
          </div>
          
          {/* Trail Effect */}
          <div className="absolute top-1/2 right-full w-20 h-1 transform -translate-y-1/2">
            <div className="h-full bg-gradient-to-r from-transparent via-yellow-400 to-orange-500 opacity-60"></div>
          </div>

          {/* Progress Label */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="glass-card px-3 py-1 rounded-lg">
              <p className="text-xs font-medium text-text-primary">
                {completedPhases}/{totalPhases} Phases Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Phase Detail Modal
  const PhaseDetailModal = ({ phase }: { phase: any }) => {
    if (!phase) return null;
    
    const Icon = phase.icon;
    
    // Handle ESC key to close modal
    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedPhase(null);
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, []);
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedPhase(null);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-start p-6 border-b border-border/50">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mr-6"
                 style={{ 
                   background: phase.color,
                   border: `1px solid ${phase.borderColor}` 
                 }}>
              <Icon className="h-8 w-8" style={{ color: phase.iconColor }} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 id="modal-title" className="text-h2 text-text-primary mb-2">
                    Phase {phase.id}: {phase.title}
                  </h3>
                  <p className="text-body-lg text-text-secondary">{phase.timeline}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(phase.status)}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPhase(null)}
                    className="hover:bg-red-500/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="glass-base p-4 rounded-lg" 
                     style={{ background: 'rgba(34, 197, 94, 0.05)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-text-primary">Apps Created</span>
                  </div>
                  <p className="text-h4 text-green-500">{phase.apps}</p>
                </div>
                <div className="glass-base p-4 rounded-lg" 
                     style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-text-primary">Developer Community</span>
                  </div>
                  <p className="text-h4 text-blue-500">{phase.developers}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Milestones */}
              <div>
                <h4 className="text-h4 text-text-primary mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Key Milestones
                </h4>
                <div className="space-y-3">
                  {phase.milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3">
                      {getMilestoneIcon(milestone.status)}
                      <div className="flex-1">
                        <p className="text-body text-text-primary">{milestone.title}</p>
                        <p className="text-sm text-text-muted">{milestone.week}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Success Targets */}
              <div>
                <h4 className="text-h4 text-text-primary mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Success Targets
                </h4>
                <div className="space-y-3">
                  {phase.targets.map((target: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <p className="text-body text-text-secondary">{target}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Parallax stars background effect - same as landing page */}
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(255, 215, 0, 0.06) 100%)' 
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
                 style={{ 
                   background: 'rgba(139, 92, 246, 0.1)', 
                   borderColor: 'rgba(139, 92, 246, 0.3)' 
                 }}>
              <Map className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
              <span className="text-sm font-medium text-text-primary">Product Roadmap</span>
            </div>
            
            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">What's Coming Next</span>
              <br />
              <span className="text-stardust-muted">AI Platform Innovation</span>
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Discover the exciting features and capabilities coming to the AI marketplace platform. 
              Built for developers, designed for innovation, with 
              <strong className="text-green-400">Phase 1, 2, and 2.5 already delivered</strong> - bringing you the fastest, 
              most flexible multi-provider AI SDK available.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary">
                <a href="#cosmic-journey" className="flex items-center space-x-2">
                  <span>Start Cosmic Journey</span>
                  <Rocket className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary">
                <Link href="/developers/docs" className="flex items-center space-x-2">
                  <span>Developer Docs</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Cosmic Journey Preview */}
            <div className="mt-12 flex justify-center items-center space-x-6 opacity-60">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-text-muted">Foundation</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-500/50 to-blue-500/50"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-xs text-text-muted">API Compat</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-purple-500/30 border border-purple-500/50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-xs text-text-muted">SDK Tools</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500/50 to-yellow-500/50"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500/30 border border-yellow-500/50 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <span className="text-xs text-text-muted">Advanced</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-500/30 to-transparent"></div>
              <div className="text-center opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-2">
                  <Map className="h-4 w-4 text-gray-500" />
                </div>
                <span className="text-xs text-text-muted">Future</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Advantages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              Why Developers Choose Our Platform
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Built with developer experience and performance at the core - delivering features that matter most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitiveAdvantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <Card key={index} className="glass-card text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto"
                         style={{ background: `${advantage.color}20`, border: `1px solid ${advantage.color}40` }}>
                      <Icon className="h-6 w-6" style={{ color: advantage.color }} />
                    </div>
                    <CardTitle className="text-h4 text-text-primary">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-glass mb-3">{advantage.description}</p>
                    <Badge className="bg-primary/10 text-primary">
                      {advantage.advantage}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Cosmic Journey Roadmap */}
      <section id="cosmic-journey" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)'
             }}>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <Rocket className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium text-text-primary">Cosmic Journey</span>
            </div>

            <h2 className="text-section-header mb-4">
              <span className="text-glass-gradient">Interactive Development Journey</span>
            </h2>
            <p className="text-body-lg text-text-secondary max-w-3xl mx-auto mb-8">
              Explore our cosmic development roadmap where each phase is a unique galaxy in the AI universe. 
              <strong className="text-green-400">3 phases completed</strong>, with advanced features launching across the cosmos.
              <br />
              <span className="text-sm text-text-muted">Click on any galaxy to explore its features and milestones</span>
            </p>
          </div>

          {/* Cosmic Journey Visualization */}
          <div className="relative mb-20">
            {/* Desktop Journey Path */}
            <div className="hidden lg:block">
              <div className="relative h-96 overflow-hidden">
                {/* Journey Path Line */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1200 400"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop offset="80%" stopColor="#8B5CF6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 300 Q 250 150 450 250 T 850 200 Q 1000 150 1150 200"
                    stroke="url(#pathGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Galaxy Phases */}
                <div className="absolute inset-0 flex items-center justify-between px-12">
                  {phases.map((phase, index) => (
                    <div 
                      key={phase.id} 
                      className={`
                        transform transition-all duration-500
                        ${index === 0 ? 'translate-y-12' : ''}
                        ${index === 1 ? 'translate-y-0' : ''}
                        ${index === 2 ? 'translate-y-8' : ''}
                        ${index === 3 ? '-translate-y-4' : ''}
                        ${index === 4 ? 'translate-y-6' : ''}
                        ${index === 5 ? 'translate-y-2' : ''}
                      `}
                    >
                      <GalaxyPhase phase={phase} index={index} />
                    </div>
                  ))}
                </div>

                {/* Rocket Progress Indicator */}
                <RocketIndicator />
              </div>
            </div>

            {/* Mobile Journey Path */}
            <div className="lg:hidden">
              <div className="space-y-16">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex flex-col items-center">
                    <GalaxyPhase phase={phase} index={index} />
                    {/* Connection line to next galaxy */}
                    {index < phases.length - 1 && (
                      <div className="mt-8 mb-8">
                        <div className="w-1 h-16 bg-gradient-to-b from-text-muted to-transparent opacity-50"></div>
                        <ChevronRight className="h-6 w-6 text-text-muted mx-auto transform rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Journey Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-h3 text-text-primary mb-2">3 Phases Complete</h3>
              <p className="text-body text-text-secondary">Foundation, API Compatibility & SDK Protection delivered</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-h3 text-text-primary mb-2">1 Phase Ready</h3>
              <p className="text-body text-text-secondary">Advanced Features & Platform Enhancement ready to start</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-h3 text-text-primary mb-2">2 Phases Planned</h3>
              <p className="text-body text-text-secondary">Enterprise Features & Marketplace Expansion coming</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.10) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.10) 100%)'
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Card className="glass-card p-12 text-center">
            <div className="relative z-10">
              <h2 className="text-hero-glass mb-6">
                Ready to Build Amazing AI Apps?
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
                Join thousands of developers building the future with our lightning-fast, multi-provider AI SDK. 
                Start free, scale effortlessly, and bring your AI ideas to life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="glass-button-primary">
                  <Link href="/developers" className="flex items-center space-x-2">
                    <span>Start Building</span>
                    <Code2 className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="glass-button-secondary">
                  <Link href="/setup" className="flex items-center space-x-2">
                    <span>Quick Setup</span>
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex justify-center space-x-8 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free tier included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Zero migration hassle</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-provider support</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Phase Detail Modal */}
      {selectedPhase && (
        <PhaseDetailModal 
          phase={phases.find(p => p.id === selectedPhase)} 
        />
      )}

      {/* Custom Galaxy Animation Styles */}
      <style jsx>{`
        .galaxy-spiral {
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            currentColor 31%,
            transparent 32%,
            transparent 40%,
            currentColor 41%,
            transparent 42%,
            transparent 50%,
            currentColor 51%,
            transparent 52%
          );
          animation: galaxyRotate 20s linear infinite;
        }

        .galaxy-nebula {
          background: radial-gradient(
            circle at 30% 40%,
            currentColor 20%,
            transparent 21%
          ),
          radial-gradient(
            circle at 70% 60%,
            currentColor 15%,
            transparent 16%
          ),
          radial-gradient(
            ellipse at center,
            transparent 60%,
            currentColor 61%,
            transparent 62%
          );
          animation: galaxyPulse 8s ease-in-out infinite;
        }

        .galaxy-cluster {
          background: radial-gradient(
            circle at 25% 25%,
            currentColor 8%,
            transparent 9%
          ),
          radial-gradient(
            circle at 75% 30%,
            currentColor 6%,
            transparent 7%
          ),
          radial-gradient(
            circle at 30% 70%,
            currentColor 7%,
            transparent 8%
          ),
          radial-gradient(
            circle at 70% 75%,
            currentColor 5%,
            transparent 6%
          ),
          radial-gradient(
            circle at 50% 50%,
            currentColor 10%,
            transparent 11%
          );
          animation: galaxyTwinkle 4s ease-in-out infinite;
        }

        .galaxy-elliptical {
          background: radial-gradient(
            ellipse 80% 40% at center,
            transparent 40%,
            currentColor 41%,
            transparent 42%,
            transparent 60%,
            currentColor 61%,
            transparent 62%
          );
          animation: galaxyRotate 15s linear infinite reverse;
        }

        .galaxy-irregular {
          background: radial-gradient(
            circle at 40% 30%,
            currentColor 15%,
            transparent 16%
          ),
          radial-gradient(
            ellipse 60% 80% at 70% 70%,
            transparent 30%,
            currentColor 31%,
            transparent 32%
          ),
          radial-gradient(
            circle at 20% 80%,
            currentColor 12%,
            transparent 13%
          );
          animation: galaxyFloat 12s ease-in-out infinite;
        }

        .galaxy-starburst {
          background: radial-gradient(
            circle at center,
            currentColor 20%,
            transparent 21%
          ),
          conic-gradient(
            from 0deg,
            transparent 0deg,
            currentColor 30deg,
            transparent 60deg,
            currentColor 90deg,
            transparent 120deg,
            currentColor 150deg,
            transparent 180deg,
            currentColor 210deg,
            transparent 240deg,
            currentColor 270deg,
            transparent 300deg,
            currentColor 330deg,
            transparent 360deg
          );
          animation: galaxyBurst 6s ease-in-out infinite;
        }

        @keyframes galaxyRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes galaxyPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        @keyframes galaxyTwinkle {
          0%, 100% { opacity: 0.8; }
          25% { opacity: 1; }
          50% { opacity: 0.6; }
          75% { opacity: 1; }
        }

        @keyframes galaxyFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-5px) rotate(2deg); }
          66% { transform: translateY(3px) rotate(-1deg); }
        }

        @keyframes galaxyBurst {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(90deg); }
          50% { transform: scale(0.95) rotate(180deg); }
          75% { transform: scale(1.05) rotate(270deg); }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .galaxy-spiral,
          .galaxy-nebula,
          .galaxy-cluster,
          .galaxy-elliptical,
          .galaxy-irregular,
          .galaxy-starburst {
            animation: none;
          }
        }
      `}</style>
    </MainLayout>
  );
}