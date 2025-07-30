'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Download, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Upload,
  Eye,
  Zap,
  Users,
  BarChart3,
  Settings,
  Play,
  DollarSign
} from 'lucide-react';

export default function LegalContractAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'pricing' | 'reviews'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      // In a real implementation, this would upload to a secure server
    }
  };

  const runAnalysis = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in real implementation, this would call our AI service)
    setTimeout(() => {
      setAnalysisResult({
        riskScore: 7.2,
        risksFound: [
          {
            type: 'High Risk',
            description: 'Unlimited liability clause detected in Section 4.2',
            recommendation: 'Consider adding liability cap of $1M or mutual limitation'
          },
          {
            type: 'Medium Risk', 
            description: 'Termination clause lacks adequate notice period',
            recommendation: 'Add 30-day written notice requirement for termination'
          },
          {
            type: 'Low Risk',
            description: 'Governing law clause may conflict with business jurisdiction',
            recommendation: 'Verify Delaware law aligns with business operations'
          }
        ],
        missingClauses: [
          'Force Majeure provisions',
          'Data privacy and security requirements',
          'Intellectual property ownership clarification'
        ],
        keyTerms: {
          contractValue: '$2.4M annually',
          term: '3 years with 2-year renewal option',
          paymentTerms: 'Net 30 days',
          deliverables: '24 monthly reports + quarterly reviews'
        },
        negotiationPoints: [
          'Request liability cap at 12 months of fees',
          'Add performance guarantees with SLA penalties',
          'Include early termination rights for material breach'
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const appStats = {
    rating: 4.9,
    reviews: 127,
    installs: '3.2K',
    lastUpdated: '2 days ago',
    developer: 'LegalAI Solutions',
    version: '2.1.0'
  };

  const features = [
    {
      icon: AlertTriangle,
      title: 'Risk Detection',
      description: 'Automatically identifies high, medium, and low-risk clauses with specific recommendations'
    },
    {
      icon: CheckCircle,
      title: 'Missing Clause Analysis',
      description: 'Detects common missing provisions that could expose your client to liability'
    },
    {
      icon: FileText,
      title: 'Key Terms Extraction',
      description: 'Summarizes critical contract terms, values, and deadlines in easy-to-read format'
    },
    {
      icon: Zap,
      title: 'Negotiation Strategy',
      description: 'Provides specific talking points and recommendations for contract negotiations'
    },
    {
      icon: Shield,
      title: 'Compliance Check',
      description: 'Verifies contract compliance with common legal standards and best practices'
    },
    {
      icon: Clock,
      title: '3-5 Hour Time Savings',
      description: 'Reduces typical contract review time from 5-8 hours to 2-3 hours per contract'
    }
  ];

  const pricingTiers = [
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Perfect for solo practitioners and small firms',
      features: [
        '50 contract analyses per month',
        'All risk detection features',
        'Email support',
        'Standard templates'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$799',
      period: '/month',
      description: 'For larger firms and corporate legal teams',
      features: [
        'Unlimited contract analyses',
        'Priority support',
        'Custom templates',
        'Team collaboration features',
        'API access'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Partner, Chen & Associates',
      rating: 5,
      text: 'This tool has revolutionized our contract review process. We catch risks we used to miss and our clients love the detailed analysis reports.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Corporate Counsel, TechCorp',
      rating: 5,
      text: 'Saves me 4-5 hours per contract review. The negotiation recommendations are spot-on and have helped us secure better terms.'
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
                          <Icon className="h-5 w-5 text-blue-600" />
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

            {/* How it Works */}
            <div>
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">1. Upload Contract</h4>
                  <p className="text-sm text-gray-600">Securely upload your contract PDF or Word document</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">2. AI Analysis</h4>
                  <p className="text-sm text-gray-600">Claude 3.5 Sonnet analyzes every clause and provision</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">3. Get Report</h4>
                  <p className="text-sm text-gray-600">Receive detailed analysis with risks and recommendations</p>
                </div>
              </div>
            </div>

            {/* AI Provider Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Shield className="h-5 w-5 mr-2" />
                  Powered by Claude 3.5 Sonnet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <p className="mb-3">
                  This app uses your Anthropic API key to access Claude 3.5 Sonnet, specifically trained for legal reasoning and contract analysis.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Estimated Cost:</strong> $0.50-2.00 per contract analysis
                  </div>
                  <div>
                    <strong>Analysis Time:</strong> 2-3 minutes per contract
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
              <h3 className="text-xl font-semibold mb-2">Try Contract Analysis</h3>
              <p className="text-gray-600 mb-6">
                Upload a sample contract to see how our AI analysis works. Your document remains secure and private.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contract Upload</CardTitle>
                <CardDescription>
                  Supported formats: PDF, DOC, DOCX (max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contract-upload">Select Contract File</Label>
                  <Input
                    id="contract-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  {uploadedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {uploadedFile} uploaded successfully
                    </p>
                  )}
                </div>

                <Button 
                  onClick={runAnalysis} 
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Contract...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Analyze Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Analysis Complete
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-red-600">
                      Risk Score: {analysisResult.riskScore}/10
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risks Found */}
                  <div>
                    <h4 className="font-semibold mb-3">Risks Identified</h4>
                    <div className="space-y-3">
                      {analysisResult.risksFound.map((risk: any, index: number) => (
                        <div key={index} className="border-l-4 border-red-400 pl-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={risk.type === 'High Risk' ? 'destructive' : risk.type === 'Medium Risk' ? 'default' : 'secondary'}>
                              {risk.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{risk.description}</p>
                          <p className="text-sm text-gray-600 mt-1">💡 {risk.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Clauses */}
                  <div>
                    <h4 className="font-semibold mb-3">Missing Clauses</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      {analysisResult.missingClauses.map((clause: string, index: number) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {clause}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Terms */}
                  <div>
                    <h4 className="font-semibold mb-3">Key Terms</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(analysisResult.keyTerms).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          <div className="font-medium">{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negotiation Points */}
                  <div>
                    <h4 className="font-semibold mb-3">Negotiation Recommendations</h4>
                    <ul className="space-y-2">
                      {analysisResult.negotiationPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">
                Professional-grade contract analysis that pays for itself with the first contract review.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <Card key={index} className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {tier.price}<span className="text-lg font-normal text-gray-600">{tier.period}</span>
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
                      Start {tier.name} Plan
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
                    <strong>Average lawyer hourly rate:</strong> $400<br />
                    <strong>Time saved per contract:</strong> 3-5 hours<br />
                    <strong>Value per contract:</strong> $1,200-2,000<br />
                    <strong>App cost per contract:</strong> ~$6 (Professional plan)<br />
                    <strong>Net savings:</strong> $1,194-1,994 per contract
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
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* App Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">Legal Contract Analyzer</h1>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                AI-powered contract analysis that identifies risks, missing clauses, and negotiation points. 
                Save 3-5 hours per contract review with Claude 3.5 Sonnet analysis.
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
                <Badge variant="outline">Claude 3.5 Sonnet</Badge>
                <Badge variant="outline">Legal Analysis</Badge>
                <Badge variant="outline">Risk Detection</Badge>
                <Badge variant="outline">Professional</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-600">$299/month</div>
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
                    ? 'border-blue-500 text-blue-600'
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