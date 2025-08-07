import { MainLayout } from '@/components/layouts/main-layout';
import { ROICalculator } from '@/components/ui/roi-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Building2,
  Clock,
  Target
} from 'lucide-react';

export default function BusinessPage() {
  const businessBenefits = [
    {
      icon: DollarSign,
      title: "Cost Optimization",
      description: "Save 60-95% on AI costs through intelligent provider routing and smart task distribution.",
      metric: "85% average savings"
    },
    {
      icon: Shield,
      title: "Enterprise Security", 
      description: "BYOK architecture with envelope encryption, audit trails, and compliance-ready infrastructure.",
      metric: "SOC2 Type II ready"
    },
    {
      icon: Clock,
      title: "Faster Time to Market",
      description: "Reduce AI integration time from months to weeks with our unified SDK and provider abstraction.",
      metric: "3x faster deployment"
    },
    {
      icon: Users,
      title: "Developer Productivity",
      description: "One API for multiple providers eliminates vendor lock-in and reduces technical debt.",
      metric: "50% less integration code"
    },
    {
      icon: BarChart3,
      title: "Usage Analytics",
      description: "Real-time cost tracking, usage patterns, and optimization recommendations.",
      metric: "Complete visibility"
    },
    {
      icon: Target,
      title: "Quality Assurance",
      description: "Cross-provider validation and quality scoring ensure consistent, reliable AI outputs.",
      metric: "99.9% reliability"
    }
  ];

  const useCases = [
    {
      title: "Enterprise Content Generation",
      description: "Scale content production while maintaining quality and controlling costs across marketing, support, and documentation teams.",
      companies: ["Fortune 500 Marketing Teams", "Content Platforms", "E-commerce Sites"]
    },
    {
      title: "Healthcare & HIPAA Compliance",
      description: "Process sensitive medical data locally while leveraging cloud AI for non-sensitive operations.",
      companies: ["Healthcare Systems", "Medical Practices", "Health Tech Startups"]
    },
    {
      title: "Financial Services",
      description: "Automated document processing, risk analysis, and customer service with regulatory compliance.",
      companies: ["Banks", "Insurance Companies", "FinTech Platforms"]
    },
    {
      title: "Software Development Teams",
      description: "Code review, documentation generation, and development acceleration with cost control.",
      companies: ["Tech Companies", "Development Agencies", "SaaS Platforms"]
    }
  ];

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
                   background: 'rgba(59, 130, 246, 0.1)', 
                   borderColor: 'rgba(59, 130, 246, 0.3)' 
                 }}>
              <Building2 className="h-3 w-3 mr-2" style={{ color: '#3B82F6' }} />
              <span className="text-sm font-medium text-text-primary">Enterprise AI Solutions</span>
            </div>
            
            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">Enterprise AI</span>
              <br />
              <span className="text-stardust-muted">Cost Optimization</span>
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Reduce AI costs by up to 95% through intelligent multi-provider orchestration. 
              Enterprise-grade security meets unprecedented cost optimization with complete transparency and no vendor lock-in.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary">
                <Link href="#roi-calculator" className="flex items-center space-x-2">
                  <span>Calculate Your Savings</span>
                  <TrendingUp className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary">
                <Link href="/demo/connection-guides" className="flex items-center space-x-2">
                  <span>View Demo</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              Why Enterprises Choose Cosmara
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Built for enterprise scale with the security, compliance, and cost control your organization needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="glass-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                         style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-h3 text-text-primary">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-glass mb-4">{benefit.description}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {benefit.metric}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <div id="roi-calculator">
        <ROICalculator />
      </div>

      {/* Use Cases Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.02) 50%, rgba(255, 215, 0, 0.03) 100%)'
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-section-header mb-4">
              Enterprise Use Cases
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              See how organizations across industries are leveraging Cosmara to optimize AI costs and performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-h3 text-text-primary">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-glass mb-6">{useCase.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-primary">Popular with:</p>
                    {useCase.companies.map((company, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-text-secondary">{company}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
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
                Ready to Optimize Your AI Costs?
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
                Join 1,000+ enterprises saving an average of 85% on AI infrastructure costs while exceeding security and performance standards.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="glass-button-primary">
                  <Link href="/setup" className="flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <Zap className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="glass-button-secondary">
                  <Link href="/developers/docs" className="flex items-center space-x-2">
                    <span>Technical Documentation</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex justify-center space-x-8 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enterprise support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SOC2 compliant</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}