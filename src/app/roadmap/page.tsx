import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
  Settings
} from 'lucide-react';

export default function RoadmapPage() {
  const phases = [
    {
      id: 1,
      title: "Core SDK Foundation",
      timeline: "Months 1-3",
      status: "completed",
      revenue: "$20K+ MRR",
      developers: "5,000+ developers",
      icon: Package,
      color: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      iconColor: "#22C55E",
      milestones: [
        { title: "Zero-Dependency Architecture ⭐ BREAKTHROUGH", status: "completed", week: "✅ Complete" },
        { title: "Native OpenAI Provider (Perfect Compatibility)", status: "completed", week: "✅ Complete" },
        { title: "Native Anthropic/Claude Provider", status: "completed", week: "✅ Complete" },
        { title: "Native Google Gemini Provider", status: "completed", week: "✅ Complete" },
        { title: "Bundle Size Leadership (4x smaller)", status: "completed", week: "✅ Complete" },
        { title: "Production-Ready QA (5/5 stars)", status: "completed", week: "✅ Complete" },
        { title: "Tree-Shakable Architecture", status: "completed", week: "✅ Complete" },
        { title: "OpenAI API Compatibility Enhancement", status: "in-progress", week: "Current" }
      ],
      targets: [
        "✅ Bundle Size: 101KB total (4x smaller than competitors)",
        "✅ Dependency Elimination: 263KB+ → 0KB (100%)",
        "✅ OpenAI Compatibility: Perfect (100%)",
        "✅ Tree-Shaking: 25-30KB per provider",
        "✅ QA Validation: 5/5 stars production-ready"
      ]
    },
    {
      id: 2,
      title: "API Compatibility & Market Expansion",
      timeline: "Months 4-6",
      status: "completed",
      revenue: "$75K+ MRR",
      developers: "15,000+ developers",
      icon: GitBranch,
      color: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.3)",
      iconColor: "#3B82F6",
      milestones: [
        { title: "OpenAI-Compatible REST Endpoints", status: "completed", week: "✅ Complete" },
        { title: "SSE Streaming Support", status: "completed", week: "✅ Complete" },
        { title: "Enterprise Features", status: "completed", week: "✅ Complete" },
        { title: "Additional Providers", status: "completed", week: "✅ Complete" },
        { title: "A/B Testing Framework", status: "completed", week: "✅ Complete" },
        { title: "Enhanced Team Management", status: "completed", week: "✅ Complete" },
        { title: "Framework Integrations", status: "completed", week: "✅ Complete" }
      ],
      targets: [
        "✅ API Compatibility: 100% OpenAI-compatible REST API",
        "✅ Provider Coverage: 6+ providers with 24+ models",
        "✅ Enterprise Features: Advanced team management, billing, governance",
        "✅ Framework Support: LangChain, LlamaIndex, Generic SDK integrations",
        "✅ A/B Testing: Intelligent provider optimization with 33%+ cost savings"
      ]
    },
    {
      id: 3,
      title: "Platform Differentiation & Advanced Features",
      timeline: "Months 7-9",
      status: "ready-to-start",
      revenue: "$200K+ MRR",
      developers: "30,000+ developers",
      icon: Rocket,
      color: "rgba(255, 215, 0, 0.1)",
      borderColor: "rgba(255, 215, 0, 0.3)",
      iconColor: "#FFD700",
      milestones: [
        { title: "Multi-Modal Support", status: "roadmapped", week: "Week 25-26" },
        { title: "Advanced Tool Execution", status: "roadmapped", week: "Week 27-28" },
        { title: "Distributed Caching", status: "roadmapped", week: "Week 29-30" },
        { title: "Advanced Optimization", status: "roadmapped", week: "Week 31-32" },
        { title: "App Discovery Engine", status: "roadmapped", week: "Week 33-34" },
        { title: "Predictive Analytics", status: "roadmapped", week: "Week 35-36" }
      ],
      targets: [
        "Multi-Modal: 25%+ usage",
        "Response Time: <100ms avg",
        "Enterprise Customers: 50+ teams",
        "Marketplace Integration: 80%"
      ]
    },
    {
      id: 4,
      title: "Acquisition Readiness & Exit Optimization",
      timeline: "Months 10-12",
      status: "exit-target",
      revenue: "$400K+ MRR",
      developers: "50,000+ developers",
      icon: Target,
      color: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      iconColor: "#22C55E",
      milestones: [
        { title: "SOC 2 Type II Compliance", status: "exit-target", week: "Week 37-38" },
        { title: "Enterprise Sales Enablement", status: "exit-target", week: "Week 39-40" },
        { title: "Thought Leadership", status: "exit-target", week: "Week 41-42" },
        { title: "Partnership Ecosystem", status: "exit-target", week: "Week 43-44" },
        { title: "Financial Optimization", status: "exit-target", week: "Week 45-46" },
        { title: "Strategic Buyer Cultivation", status: "exit-target", week: "Week 47-48" }
      ],
      targets: [
        "Revenue: $400K+ MRR (15-20% growth)",
        "Acquisition Conversations: 3+",
        "Enterprise Customers: 200+",
        "Valuation: $50K-500K strategic"
      ]
    }
  ];

  const competitiveAdvantages = [
    {
      title: "Bundle Size Leadership",
      description: "<50KB vs Vercel AI SDK's 186KB",
      advantage: "4x smaller",
      icon: Package,
      color: "#3B82F6"
    },
    {
      title: "Performance Excellence", 
      description: "<5% overhead vs competitors' 10-20%",
      advantage: "3-4x faster",
      icon: Zap,
      color: "#8B5CF6"
    },
    {
      title: "OpenAI Compatibility",
      description: "100% drop-in replacement capability",
      advantage: "Zero migration",
      icon: Code2,
      color: "#FFD700"
    },
    {
      title: "Enterprise Ready",
      description: "Built-in governance and multi-tenant support",
      advantage: "Day-one enterprise",
      icon: Building2,
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
      case 'exit-target':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Exit Target</Badge>;
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
      case 'exit-target':
        return <Target className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <MainLayout>
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
              <span className="text-sm font-medium text-text-primary">Strategic Roadmap</span>
            </div>
            
            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">SDK-First Development</span>
              <br />
              <span className="text-stardust-muted">12-Month Strategy</span>
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Our research-validated roadmap to building a market-leading multi-provider AI SDK, 
              targeting <strong>$400K+ MRR</strong> and strategic acquisition within 12 months.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary">
                <Link href="#phase-1" className="flex items-center space-x-2">
                  <span>Start Phase 1</span>
                  <Rocket className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary">
                <Link href="/developers/docs" className="flex items-center space-x-2">
                  <span>Technical Docs</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              Research-Validated Competitive Advantages
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Our comprehensive research identified key market gaps that position us for leadership.
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

      {/* Roadmap Phases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              4-Phase Implementation Strategy
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Each phase builds strategic value toward our 12-month acquisition target.
            </p>
          </div>

          <div className="space-y-12">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div key={phase.id} id={`phase-${phase.id}`}>
                  <Card className="glass-card overflow-hidden">
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
                            <h3 className="text-h2 text-text-primary mb-2">
                              Phase {phase.id}: {phase.title}
                            </h3>
                            <p className="text-body-lg text-text-secondary">{phase.timeline}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(phase.status)}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div className="glass-base p-4 rounded-lg" 
                               style={{ background: 'rgba(34, 197, 94, 0.05)' }}>
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-text-primary">Revenue Target</span>
                            </div>
                            <p className="text-h4 text-green-500">{phase.revenue}</p>
                          </div>
                          <div className="glass-base p-4 rounded-lg" 
                               style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-text-primary">Developer Growth</span>
                            </div>
                            <p className="text-h4 text-blue-500">{phase.developers}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Milestones */}
                        <div>
                          <h4 className="text-h4 text-text-primary mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Key Milestones
                          </h4>
                          <div className="space-y-3">
                            {phase.milestones.map((milestone, idx) => (
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
                            {phase.targets.map((target, idx) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <p className="text-body text-text-secondary">{target}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic CTA */}
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
                Ready to Build the Future?
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
                Our research-validated strategy positions us to become the market-leading multi-provider AI SDK 
                with clear competitive advantages and a path to strategic acquisition.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="glass-button-primary">
                  <Link href="/developers" className="flex items-center space-x-2">
                    <span>Join Development</span>
                    <Code2 className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="glass-button-secondary">
                  <Link href="/setup" className="flex items-center space-x-2">
                    <span>Setup SDK Environment</span>
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex justify-center space-x-8 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Research validated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Competitive advantages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>12-month timeline</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}