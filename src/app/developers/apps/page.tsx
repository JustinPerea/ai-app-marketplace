'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  Package, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users,
  Download
} from 'lucide-react';

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

interface DashboardStats {
  pending: number;
  approved: number;
  published: number;
  rejected: number;
}

export default function DeveloperAppsPage() {
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, approved: 0, published: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/developers/apps');
      
      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }

      const data = await response.json();
      setApps(data.apps || []);
      setStats(data.summary || { pending: 0, approved: 0, published: 0, rejected: 0 });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-hero-glass mb-2">
                  <span className="text-glass-gradient">My App Submissions</span>
                </h1>
                <p className="text-body-lg text-text-secondary">
                  Manage your submitted applications and track their review status
                </p>
              </div>
              
              <Button asChild>
                <Link href="/developers/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New App
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                      <p className="text-sm text-gray-600">Pending Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                      <p className="text-sm text-gray-600">Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                      <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="glass-card border-red-200 bg-red-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Error loading apps: {error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apps List */}
          {apps.length === 0 ? (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Apps Submitted</h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any apps yet. Create your first AI application for the marketplace.
                </p>
                <Button asChild>
                  <Link href="/developers/submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First App
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {apps.map((app) => (
                <Card key={app.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={app.iconUrl} 
                          alt={app.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMSAxNS02LTYtNiA2Ii8+CjxwYXRoIGQ9Im05IDktMyAzIi8+CjxwYXRoIGQ9Im0yMSA5LTIgMmMtLjk4Ljk4LTIuMzQgMS40OC0zLjY2IDEuNzNhNjguNjggNjguNjggMCAwIDEtMTAuNjggMHoiLz4KPC9zdmc+Cg==";
                          }}
                        />
                        <div>
                          <CardTitle className="text-xl">{app.name}</CardTitle>
                          <CardDescription>{app.shortDescription}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{app.category.replace('_', ' ')}</Badge>
                            <Badge className={getStatusColor(app.status)}>
                              {getStatusIcon(app.status)}
                              <span className="ml-1">{app.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-sm font-medium">{formatDate(app.submittedAt)}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* App Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <Download className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium">{app.downloads}</p>
                        <p className="text-xs text-gray-500">Downloads</p>
                      </div>
                      
                      <div className="text-center">
                        <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium">{app.reviewCount}</p>
                        <p className="text-xs text-gray-500">Reviews</p>
                      </div>
                      
                      <div className="text-center">
                        <TrendingUp className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium">v{app.version}</p>
                        <p className="text-xs text-gray-500">Version</p>
                      </div>
                    </div>

                    {/* Review Notes */}
                    {app.reviewNotes && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Review Notes:</p>
                        <p className="text-sm text-blue-800">{app.reviewNotes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {(app.status === 'NEEDS_CHANGES' || app.status === 'REJECTED') && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit App
                        </Button>
                      )}
                      
                      {app.status === 'PUBLISHED' && app.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Live
                          </a>
                        </Button>
                      )}
                      
                      {app.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}