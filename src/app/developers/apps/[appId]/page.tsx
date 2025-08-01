'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  ArrowLeft,
  Package,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Download,
  Users,
  Star,
  DollarSign,
  Code,
  Globe,
  Github,
  Image,
  Tag,
  Settings,
  TrendingUp
} from 'lucide-react';
import { ProviderLogo } from '@/components/ui/provider-logo';

interface AppSubmission {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  pricing: string;
  price?: number;
  requiredProviders: string[];
  supportedLocalModels: string[];
  iconUrl: string;
  screenshotUrls: string[];
  demoUrl?: string;
  githubUrl?: string;
  runtimeType: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'NEEDS_CHANGES';
  submittedAt: string;
  submittedBy: string;
  reviewNotes?: string;
  approvedAt?: string;
  publishedAt?: string;
  version: string;
  downloads: number;
  rating?: number;
  reviewCount: number;
}

export default function AppDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appId = params.appId as string;

  useEffect(() => {
    if (appId) {
      fetchApp();
    }
  }, [appId]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/developers/apps/${appId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('App not found');
          return;
        }
        throw new Error('Failed to fetch app details');
      }

      const data = await response.json();
      setApp(data.app);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEEDS_CHANGES':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PUBLISHED':
        return <Eye className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'NEEDS_CHANGES':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DEVELOPER_TOOLS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTENT_CREATION': return 'bg-green-100 text-green-800 border-green-200';
      case 'LEGAL_TOOLS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MEDICAL_TOOLS': return 'bg-red-100 text-red-800 border-red-200';
      case 'BUSINESS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'EDUCATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !app) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">App Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The requested app could not be found.'}</p>
            <Button asChild>
              <Link href="/developers/apps">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Apps
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Simple stars background with parallax scrolling */}
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Cosmara stellar background with cosmic gradients */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
           }}>
      </div>
      
      <div className="min-h-screen p-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/developers/apps">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Apps
              </Link>
            </Button>
          </div>

          {/* App Header */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <div className="flex items-start space-x-6">
                <img 
                  src={app.iconUrl} 
                  alt={app.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMSAxNS02LTYtNiA2Ii8+CjxwYXRoIGQ9Im05IDktMyAzIi8+CjxwYXRoIGQ9Im0yMSA5LTIgMmMtLjk4Ljk4LTIuMzQgMS40OC0zLjY2IDEuNzNhNjguNjggNjguNjggMCAwIDEtMTAuNjggMHoiLz4KPC9zdmc+Cg==";
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">{app.name}</CardTitle>
                    <Badge className={getStatusColor(app.status)}>
                      {getStatusIcon(app.status)}
                      <span className="ml-1">{app.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  
                  <CardDescription className="text-lg mb-3">
                    {app.shortDescription}
                  </CardDescription>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(app.category)}>
                      <Tag className="h-3 w-3 mr-1" />
                      {app.category.replace('_', ' ')}
                    </Badge>
                    
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {app.pricing}
                      {app.price && ` - $${app.price}`}
                    </Badge>
                    
                    <Badge variant="outline">
                      v{app.version}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* App Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Download className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{app.downloads}</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{app.reviewCount}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {app.rating ? app.rating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Rating</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(app.submittedAt).split(',')[0]}
                </p>
                <p className="text-sm text-gray-600">Submitted</p>
              </CardContent>
            </Card>
          </div>

          {/* Review Status */}
          {app.reviewNotes && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Review Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{app.reviewNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* App Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{app.description}</p>
                </CardContent>
              </Card>

              {/* Screenshots */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Screenshots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {app.screenshotUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE2Ij5TY3JlZW5zaG90ICN7aW5kZXggKyAxfTwvdGV4dD4KPC9zdmc+Cg==";
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technical Info */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Providers:</p>
                    <div className="flex flex-wrap gap-1">
                      {app.requiredProviders.map((provider) => (
                        <div key={provider} className="flex items-center space-x-1 p-1 bg-gray-100 rounded">
                          <ProviderLogo provider={provider} size={16} />
                          <span className="text-xs">{provider}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {app.supportedLocalModels.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Local Models:</p>
                      <div className="flex flex-wrap gap-1">
                        {app.supportedLocalModels.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Runtime:</p>
                    <Badge variant="outline">
                      <Code className="h-3 w-3 mr-1" />
                      {app.runtimeType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Links */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {app.demoUrl && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  
                  {app.githubUrl && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Source Code
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                {(app.status === 'NEEDS_CHANGES' || app.status === 'REJECTED') && (
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit App
                  </Button>
                )}
                
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  App Settings
                </Button>
                
                {app.status !== 'PUBLISHED' && (
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete App
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}