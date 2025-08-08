'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppDetailNavigation } from '@/components/navigation/app-detail-navigation';
import { 
  Star, 
  Download, 
  Shield, 
  Mic,
  FileText,
  Clock,
  Lock,
  Server,
  CheckCircle,
  Play,
  Square,
  Upload,
  Eye,
  Users,
  Settings,
  Home,
  Zap,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

export default function HIPAAMedicalScribePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'pricing' | 'reviews'>('overview');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setTranscriptionResult({
          patientInfo: {
            name: 'Jane Smith',
            age: 34,
            visitDate: '2024-01-15',
            appointmentType: 'Follow-up consultation'
          },
          chiefComplaint: 'Patient reports persistent fatigue and intermittent headaches over the past 3 weeks.',
          history: 'Patient is a 34-year-old female presenting with a 3-week history of fatigue and headaches. Fatigue is described as moderate to severe, affecting daily activities. Headaches are bifrontal, throbbing in nature, occurring 3-4 times per week.',
          physicalExam: {
            vitals: 'BP: 128/82, HR: 76, Temp: 98.6°F, RR: 16, O2 Sat: 98%',
            general: 'Patient appears well, alert and oriented',
            heent: 'PERRLA, no lymphadenopathy, TMs clear bilaterally',
            cardiovascular: 'RRR, no murmurs, rubs, or gallops',
            pulmonary: 'Clear to auscultation bilaterally'
          },
          assessment: 'Chronic fatigue syndrome vs. tension headaches. Rule out sleep disorders and stress-related causes.',
          plan: [
            'CBC with differential and comprehensive metabolic panel',
            'TSH and free T4 to rule out thyroid dysfunction',
            'Sleep study if symptoms persist',
            'Follow-up in 2 weeks or sooner if symptoms worsen',
            'Patient education on sleep hygiene and stress management'
          ],
          billingCodes: [
            { code: '99213', description: 'Office visit, established patient, low complexity' },
            { code: '84443', description: 'TSH test' },
            { code: '85025', description: 'Complete blood count' }
          ]
        });
        setIsProcessing(false);
        setRecordingTime(0);
      }, 4000);
    } else {
      // Start recording
      setIsRecording(true);
      setTranscriptionResult(null);
      
      // Simulate recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (!isRecording) {
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const appStats = {
    rating: 4.8,
    reviews: 89,
    installs: '1.8K',
    lastUpdated: '1 day ago',
    developer: 'HealthTech AI',
    version: '1.4.2'
  };

  const features = [
    {
      icon: Home,
      title: 'Local AI Processing',
      description: 'All processing happens on your device using Ollama. Patient data never leaves your system.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Designed with healthcare privacy requirements. No cloud storage or external API calls.'
    },
    {
      icon: Mic,
      title: 'Real-time Transcription',
      description: 'Convert patient consultations to accurate text transcriptions in real-time.'
    },
    {
      icon: FileText,
      title: 'Structured Notes',
      description: 'Automatically formats notes into SOAP format with proper medical terminology.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      description: 'End-to-end encryption with local storage. You control all patient data.'
    },
    {
      icon: Clock,
      title: '60% Time Savings',
      description: 'Reduce documentation time from 15 minutes to 6 minutes per patient visit.'
    }
  ];

  const localModels = [
    {
      name: 'Llama 2 Medical',
      size: '7B',
      description: 'Optimized for medical terminology and SOAP note generation',
      recommended: true
    },
    {
      name: 'Code Llama Medical',
      size: '13B', 
      description: 'Enhanced medical coding and billing code generation',
      recommended: false
    },
    {
      name: 'Mistral Medical',
      size: '7B',
      description: 'Fast processing with good medical accuracy',
      recommended: false
    }
  ];

  const complianceFeatures = [
    'No data transmitted to external servers',
    'Local storage with AES-256 encryption',
    'Audit trails for all patient data access',
    'Automatic data retention policy enforcement',
    'Role-based access controls',
    'PHI anonymization options'
  ];

  const pricingTiers = [
    {
      name: 'Solo Practice',
      price: '$149',
      period: '/month',
      description: 'Perfect for individual practitioners',
      features: [
        'Up to 200 patient visits per month',
        'Local AI processing (Ollama)',
        'SOAP note generation',
        'Basic billing codes',
        'Email support'
      ],
      popular: true
    },
    {
      name: 'Group Practice',
      price: '$399',
      period: '/month',
      description: 'For small to medium practices',
      features: [
        'Unlimited patient visits',
        'Multi-user access',
        'Advanced billing integration',
        'Custom templates',
        'Priority support',
        'Practice analytics'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Emily Watson',
      role: 'Family Medicine, Watson Clinic',
      rating: 5,
      text: 'Finally, an AI scribe that respects patient privacy. The local processing gives me complete peace of mind while saving hours of documentation time.'
    },
    {
      name: 'Dr. James Liu',
      role: 'Internal Medicine, City Medical Center',
      rating: 5,
      text: 'The SOAP note formatting is incredibly accurate. It catches medical terms that other systems miss, and the billing codes are spot-on.'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* HIPAA Compliance Banner */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-900">
                  <Shield className="h-5 w-5 mr-2" />
                  HIPAA Compliant Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-800">
                <p className="mb-3">
                  This application processes all patient data locally on your device using Ollama AI models. 
                  No patient information is ever transmitted to external servers or cloud services.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {complianceFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                          <Icon className="h-5 w-5 text-green-600" />
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
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mic className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">1. Record Visit</h4>
                  <p className="text-sm text-gray-600">Start recording during your patient consultation</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Server className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">2. Local Processing</h4>
                  <p className="text-sm text-gray-600">Ollama AI processes audio on your local machine</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">3. Generate SOAP</h4>
                  <p className="text-sm text-gray-600">Structured medical notes in proper SOAP format</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">4. Secure Storage</h4>
                  <p className="text-sm text-gray-600">Encrypted local storage with full data control</p>
                </div>
              </div>
            </div>

            {/* Supported Local Models */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Supported Local AI Models</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {localModels.map((model, index) => (
                  <Card key={index} className={model.recommended ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{model.name}</CardTitle>
                        {model.recommended && (
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="w-fit text-xs">{model.size} Parameters</Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{model.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Settings className="h-5 w-5 mr-2" />
                  System Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Minimum Requirements:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• 8GB RAM</li>
                      <li>• 10GB free disk space</li>
                      <li>• Ollama installed</li>
                      <li>• Microphone access</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Recommended:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• 16GB+ RAM</li>
                      <li>• SSD storage</li>
                      <li>• Dedicated GPU (optional)</li>
                      <li>• High-quality microphone</li>
                    </ul>
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
              <h3 className="text-xl font-semibold mb-2">Try Medical Scribe Demo</h3>
              <p className="text-gray-600 mb-6">
                Record a sample patient consultation to see how our local AI generates structured SOAP notes.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Voice Recording</CardTitle>
                <CardDescription>
                  Click the microphone to start recording your patient consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={toggleRecording}
                    size="lg"
                    variant={isRecording ? 'destructive' : 'default'}
                    className="h-20 w-20 rounded-full"
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <Square className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  <div className="mt-4">
                    {isRecording && (
                      <div className="text-red-600 font-medium">
                        🔴 Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    {isProcessing && (
                      <div className="text-blue-600 font-medium">
                        <Settings className="h-4 w-4 inline animate-spin mr-2" />
                        Processing with Ollama...
                      </div>
                    )}
                    {!isRecording && !isProcessing && (
                      <div className="text-gray-600">
                        Click to start recording
                      </div>
                    )}
                  </div>
                </div>

                {!isRecording && !isProcessing && !transcriptionResult && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 text-center">
                        <strong>Sample consultation to try:</strong><br />
                        "Patient is a 34-year-old female presenting with fatigue and headaches for 3 weeks. 
                        Vitals are stable. Physical exam shows no acute findings. Plan includes lab work and follow-up."
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {transcriptionResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Generated SOAP Note
                  </CardTitle>
                  <CardDescription>
                    Processed locally with Ollama Llama 2 Medical model
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Patient Information</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {transcriptionResult.patientInfo.name}</div>
                      <div><strong>Age:</strong> {transcriptionResult.patientInfo.age}</div>
                      <div><strong>Visit Date:</strong> {transcriptionResult.patientInfo.visitDate}</div>
                      <div><strong>Type:</strong> {transcriptionResult.patientInfo.appointmentType}</div>
                    </div>
                  </div>

                  {/* SOAP Format */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">S - Subjective</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p><strong>Chief Complaint:</strong> {transcriptionResult.chiefComplaint}</p>
                        <p className="mt-2"><strong>History:</strong> {transcriptionResult.history}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">O - Objective</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p><strong>Vital Signs:</strong> {transcriptionResult.physicalExam.vitals}</p>
                        <p><strong>General:</strong> {transcriptionResult.physicalExam.general}</p>
                        <p><strong>HEENT:</strong> {transcriptionResult.physicalExam.heent}</p>
                        <p><strong>Cardiovascular:</strong> {transcriptionResult.physicalExam.cardiovascular}</p>
                        <p><strong>Pulmonary:</strong> {transcriptionResult.physicalExam.pulmonary}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">A - Assessment</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p>{transcriptionResult.assessment}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">P - Plan</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <ul className="space-y-1">
                          {transcriptionResult.plan.map((item: string, index: number) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Billing Codes */}
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Billing Codes</h4>
                    <div className="space-y-2">
                      {transcriptionResult.billingCodes.map((code: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <strong>{code.code}</strong> - {code.description}
                          </div>
                        </div>
                      ))}
                    </div>
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
                Professional medical scribe with complete HIPAA compliance and local processing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <Card key={index} className={`relative ${tier.popular ? 'border-green-500 shadow-lg' : ''}`}>
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
                  <h4 className="font-semibold text-green-900 mb-2">Cost Savings Calculator</h4>
                  <p className="text-green-800 text-sm">
                    <strong>Average physician documentation time:</strong> 15 min/patient<br />
                    <strong>Time with AI scribe:</strong> 6 min/patient<br />
                    <strong>Time saved:</strong> 9 minutes per patient<br />
                    <strong>For 20 patients/day:</strong> 3 hours saved daily<br />
                    <strong>Value of time saved:</strong> $600-1,200/day
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900 mb-2">No Hidden Costs</h4>
                  <p className="text-blue-800 text-sm">
                    Unlike cloud-based solutions, there are no per-minute charges, API costs, or data transfer fees.
                    Your Ollama models run locally at no additional cost per use.
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
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
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

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Privacy Notice</h4>
                    <p className="text-yellow-800 text-sm">
                      All reviews are from verified medical professionals. Patient-specific information has been removed 
                      to maintain HIPAA compliance. Reviews focus on app functionality and workflow improvements only.
                    </p>
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
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header with Back Button and Breadcrumbs */}
        <AppDetailNavigation 
          appName="HIPAA Medical Scribe"
          categoryName="Medical Tools"
          categorySlug="MEDICAL_TOOLS"
          onTryDemo={() => setActiveTab('demo')}
        />

        {/* App Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <div className="h-24 w-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Mic className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">HIPAA Medical Scribe</h1>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline">
                  <Home className="h-3 w-3 mr-1" />
                  Local AI
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                Voice-to-structured medical notes with local AI processing. Complete HIPAA compliance using 
                Ollama models for patient privacy protection. 60% reduction in documentation time.
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
                <Badge variant="outline">🏠 Ollama</Badge>
                <Badge variant="outline">HIPAA</Badge>
                <Badge variant="outline">SOAP Notes</Badge>
                <Badge variant="outline">Local Processing</Badge>
                <Badge variant="outline">Medical AI</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-600">$149/month</div>
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
                    ? 'border-green-500 text-green-600'
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
    
  );
}