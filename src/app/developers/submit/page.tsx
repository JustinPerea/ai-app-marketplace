'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProviderRequiredNotice } from '@/components/ui/provider-required-notice';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Code2, 
  Package, 
  Settings,
  Upload,
  Eye,
  AlertCircle,
  Info,
  Rocket,
  Globe,
  Github,
  Image,
  DollarSign
} from 'lucide-react';

// Types
interface AppFormData {
  // Basic Information
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  
  // Pricing
  pricing: string;
  price: string;
  
  // Technical
  requiredProviders: string[];
  supportedLocalModels: string[];
  
  // Assets
  iconUrl: string;
  screenshotUrls: string[];
  demoUrl: string;
  githubUrl: string;
  
  // Runtime (placeholder for future)
  runtimeType: string;
}

const initialFormData: AppFormData = {
  name: '',
  shortDescription: '',
  description: '',
  category: '',
  tags: [],
  pricing: 'FREE',
  price: '',
  requiredProviders: [],
  supportedLocalModels: [],
  iconUrl: '',
  screenshotUrls: [],
  demoUrl: '',
  githubUrl: '',
  runtimeType: 'JAVASCRIPT'
};

const CATEGORIES = [
  { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'CONTENT_CREATION', label: 'Content Creation' },
  { value: 'DATA_ANALYSIS', label: 'Data Analysis' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'DEVELOPER_TOOLS', label: 'Developer Tools' },
  { value: 'CODE_GENERATION', label: 'Code Generation' },
  { value: 'LEGAL_TOOLS', label: 'Legal Tools' },
  { value: 'MEDICAL_TOOLS', label: 'Medical Tools' },
  { value: 'RESEARCH_TOOLS', label: 'Research Tools' },
  { value: 'MARKETING_TOOLS', label: 'Marketing Tools' },
  { value: 'DESIGN_TOOLS', label: 'Design Tools' },
  { value: 'OTHER', label: 'Other' }
];

const AI_PROVIDERS = [
  { value: 'OPENAI', label: 'OpenAI (GPT-4, GPT-3.5)' },
  { value: 'ANTHROPIC', label: 'Anthropic (Claude)' },
  { value: 'GOOGLE', label: 'Google (Gemini)' },
  { value: 'AZURE_OPENAI', label: 'Azure OpenAI' },
  { value: 'COHERE', label: 'Cohere' },
  { value: 'HUGGING_FACE', label: 'Hugging Face' }
];

const LOCAL_MODELS = [
  { value: 'OLLAMA', label: 'Ollama (Llama 2, Code Llama, etc.)' },
  { value: 'LLAMACPP', label: 'LlamaCPP' },
  { value: 'GGML', label: 'GGML' },
  { value: 'HUGGINGFACE_LOCAL', label: 'Hugging Face Local' },
  { value: 'CUSTOM', label: 'Custom Local Model' }
];

const PRICING_MODELS = [
  { value: 'FREE', label: 'Free', description: 'Completely free to use' },
  { value: 'FREEMIUM', label: 'Freemium', description: 'Free tier with paid upgrades' },
  { value: 'PAID', label: 'Paid', description: 'One-time or subscription fee' },
  { value: 'PAY_PER_USE', label: 'Pay Per Use', description: 'Users pay per execution' },
  { value: 'BYOK_ONLY', label: 'BYOK Only', description: 'Users only pay AI provider costs' }
];

const steps = [
  { id: 1, title: 'Basic Info', icon: Package },
  { id: 2, title: 'Technical', icon: Code2 },
  { id: 3, title: 'Pricing', icon: DollarSign },
  { id: 4, title: 'Assets', icon: Image },
  { id: 5, title: 'Review', icon: Eye }
];

export default function SubmitAppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AppFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Optional: guard submission if not signed in
    // We keep the form visible but show a hint at the top when logged out
  }, [user, loading]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim()) && formData.tags.length < 10) {
      updateFormData('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addScreenshot = (url: string) => {
    if (url.trim() && formData.screenshotUrls.length < 5) {
      updateFormData('screenshotUrls', [...formData.screenshotUrls, url.trim()]);
    }
  };

  const removeScreenshot = (urlToRemove: string) => {
    updateFormData('screenshotUrls', formData.screenshotUrls.filter(url => url !== urlToRemove));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) newErrors.name = 'App name is required';
        if (formData.name.length > 100) newErrors.name = 'App name must be 100 characters or less';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (formData.shortDescription.length > 200) newErrors.shortDescription = 'Short description must be 200 characters or less';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 100) newErrors.description = 'Description must be at least 100 characters';
        if (formData.description.length > 5000) newErrors.description = 'Description must be 5000 characters or less';
        if (!formData.category) newErrors.category = 'Category is required';
        if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required';
        break;

      case 2: // Technical
        if (formData.requiredProviders.length === 0) {
          newErrors.requiredProviders = 'At least one AI provider is required';
        }
        break;

      case 3: // Pricing
        if (!formData.pricing) newErrors.pricing = 'Pricing model is required';
        if (formData.pricing === 'PAID' && (!formData.price || parseFloat(formData.price) <= 0)) {
          newErrors.price = 'Price is required for paid apps';
        }
        if (formData.pricing === 'PAID' && parseFloat(formData.price) > 999.99) {
          newErrors.price = 'Price cannot exceed $999.99';
        }
        break;

      case 4: // Assets
        if (!formData.iconUrl.trim()) newErrors.iconUrl = 'App icon is required';
        if (formData.screenshotUrls.length === 0) {
          newErrors.screenshotUrls = 'At least one screenshot is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitApp = async () => {
    if (!validateStep(4)) return; // Validate all previous steps

    setIsSubmitting(true);
    try {
      // Remove empty URL fields from formData before spreading
      const { demoUrl, githubUrl, ...formDataWithoutUrls } = formData;
      
      const submitData = {
        ...formDataWithoutUrls,
        price: formData.pricing === 'PAID' ? parseFloat(formData.price) : undefined,
        tags: formData.tags,
        requiredProviders: formData.requiredProviders,
        screenshotUrls: formData.screenshotUrls,
        // Only include optional URL fields if they have valid values
        ...(demoUrl?.trim() && { demoUrl: demoUrl.trim() }),
        ...(githubUrl?.trim() && { githubUrl: githubUrl.trim() })
      };

      const response = await fetch('/api/developers/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to the developer dashboard or app management page
        router.push(`/developers/apps/${result.app.id}`);
      } else {
        const error = await response.json();
        setErrors({ submit: error.error || 'Failed to submit app' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="My Awesome AI App"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                placeholder="A brief one-line description of your app"
                className={errors.shortDescription ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.shortDescription.length}/200 characters
              </p>
              {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Provide a detailed description of your app, its features, and benefits..."
                rows={8}
                className={`w-full p-3 border rounded-md resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/5000 characters (minimum 100)
              </p>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className={`w-full p-3 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label>Tags * (max 10)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={formData.tags.length >= 10}
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Required AI Provider(s) *</Label>
              <p className="text-sm text-gray-500 mb-3">
                Select which AI providers your app requires users to have API keys for
              </p>
              <div className="space-y-2">
                {AI_PROVIDERS.map(provider => (
                  <label key={provider.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.requiredProviders.includes(provider.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('requiredProviders', [...formData.requiredProviders, provider.value]);
                        } else {
                          updateFormData('requiredProviders', formData.requiredProviders.filter(p => p !== provider.value));
                        }
                      }}
                    />
                    <span>{provider.label}</span>
                  </label>
                ))}
              </div>
              {errors.requiredProviders && <p className="text-red-500 text-sm mt-1">{errors.requiredProviders}</p>}
            </div>

            <div>
              <Label>Supported Local Models (Optional)</Label>
              <p className="text-sm text-gray-500 mb-3">
                Select which local AI models your app supports for on-device processing
              </p>
              <div className="space-y-2">
                {LOCAL_MODELS.map(model => (
                  <label key={model.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.supportedLocalModels.includes(model.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('supportedLocalModels', [...formData.supportedLocalModels, model.value]);
                        } else {
                          updateFormData('supportedLocalModels', formData.supportedLocalModels.filter(m => m !== model.value));
                        }
                      }}
                    />
                    <span>{model.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900 text-base">
                  <Info className="h-4 w-4 mr-2" />
                  BYOK Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800">
                <p>
                  With the Bring Your Own Key (BYOK) model, users maintain control of their AI provider costs 
                  and data. Your app will use their API keys securely to make AI requests.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Pricing Model *</Label>
              <div className="grid gap-4 mt-3">
                {PRICING_MODELS.map(model => (
                  <label
                    key={model.value}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.pricing === model.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing"
                      value={model.value}
                      checked={formData.pricing === model.value}
                      onChange={(e) => updateFormData('pricing', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-sm text-gray-600">{model.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.pricing && <p className="text-red-500 text-sm mt-1">{errors.pricing}</p>}
            </div>

            {(formData.pricing === 'PAID' || formData.pricing === 'FREEMIUM') && (
              <div>
                <Label htmlFor="price">Monthly Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    max="999.99"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder="29.99"
                    className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            )}

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-900 text-base">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Revenue Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-800">
                <p>
                  We take a 15% commission from your app revenue. You keep 85% of all earnings.
                  First $100K in revenue is commission-free for new developers!
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="iconUrl">App Icon URL *</Label>
              <Input
                id="iconUrl"
                value={formData.iconUrl}
                onChange={(e) => updateFormData('iconUrl', e.target.value)}
                placeholder="https://example.com/icon.png"
                className={errors.iconUrl ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 512x512px PNG or JPG
              </p>
              {errors.iconUrl && <p className="text-red-500 text-sm mt-1">{errors.iconUrl}</p>}
            </div>

            <div>
              <Label>Screenshots * (max 5)</Label>
              <div className="space-y-2 mb-3">
                {formData.screenshotUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={url} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeScreenshot(url)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                placeholder="https://example.com/screenshot.png"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addScreenshot(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={formData.screenshotUrls.length >= 5}
              />
              <p className="text-sm text-gray-500 mt-1">
                Add screenshot URL and press Enter. Recommended: 1920x1080px
              </p>
              {errors.screenshotUrls && <p className="text-red-500 text-sm mt-1">{errors.screenshotUrls}</p>}
            </div>

            <div>
              <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
              <Input
                id="demoUrl"
                value={formData.demoUrl}
                onChange={(e) => updateFormData('demoUrl', e.target.value)}
                placeholder="https://demo.example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to a live demo of your app
              </p>
            </div>

            <div>
              <Label htmlFor="githubUrl">GitHub Repository (Optional)</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => updateFormData('githubUrl', e.target.value)}
                placeholder="https://github.com/username/repo"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to source code (recommended for open source apps)
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your App Submission</CardTitle>
                <CardDescription>
                  Please review all information before submitting for approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Basic Information</h4>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Category:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}</p>
                  <p><strong>Short Description:</strong> {formData.shortDescription}</p>
                  <p><strong>Tags:</strong> {formData.tags.join(', ')}</p>
                </div>

                <div>
                  <h4 className="font-semibold">Technical Requirements</h4>
                  <p><strong>Required Providers:</strong> {formData.requiredProviders.map(p => 
                    AI_PROVIDERS.find(ap => ap.value === p)?.label
                  ).join(', ')}</p>
                  {formData.supportedLocalModels.length > 0 && (
                    <p><strong>Local Models:</strong> {formData.supportedLocalModels.map(m => 
                      LOCAL_MODELS.find(lm => lm.value === m)?.label
                    ).join(', ')}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold">Pricing</h4>
                  <p><strong>Model:</strong> {PRICING_MODELS.find(p => p.value === formData.pricing)?.label}</p>
                  {formData.pricing === 'PAID' && (
                    <p><strong>Price:</strong> ${formData.price}/month</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold">Assets</h4>
                  <p><strong>Icon:</strong> {formData.iconUrl ? 'Provided' : 'Missing'}</p>
                  <p><strong>Screenshots:</strong> {formData.screenshotUrls.length} uploaded</p>
                  {formData.demoUrl && <p><strong>Demo:</strong> {formData.demoUrl}</p>}
                  {formData.githubUrl && <p><strong>GitHub:</strong> {formData.githubUrl}</p>}
                </div>
              </CardContent>
            </Card>

            {errors.submit && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Provider notice */}
        {!loading && !user && (
          <div className="mb-6">
            <ProviderRequiredNotice providerIds={["OPENAI","ANTHROPIC","GOOGLE"]} message="You’ll need at least one provider connected to test your app. Go to Setup to connect keys." />
          </div>
        )}
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Package className="h-3 w-3 mr-1" />
            App Submission
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Submit Your AI Application
          </h1>
          <p className="text-lg text-gray-600">
            Share your AI innovation with thousands of users in our marketplace.
          </p>
        </div>

        {!loading && !user && (
          <div className="mb-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                You must be signed in to submit an application.{' '}
                <Link href="/auth/login" className="underline hover:no-underline">Sign in</Link> to continue.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center min-w-[84px]">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 mr-2" })}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submitApp} disabled={isSubmitting}>
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit for Review
                  <Rocket className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
  );
}