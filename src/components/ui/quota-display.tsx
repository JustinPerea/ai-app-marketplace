/**
 * Quota Display Component
 * 
 * Shows user's current quota status and upgrade prompts
 * Handles both instant (shared pool) and connected (private) access
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Shield, 
  Bot,
  ExternalLink,
  Rocket
} from 'lucide-react';

interface QuotaDisplayProps {
  userId: string;
  onUpgrade?: (provider: string) => void;
  onConnectApiKey?: (provider: string) => void;
}

interface AccessTierStatus {
  userId: string;
  currentTier: 'instant' | 'connected' | 'paid';
  hasConnections: boolean;
  connections: Array<{
    provider: string;
    connectionType: 'oauth2' | 'api_key';
    connected: boolean;
    connectedAt: string;
    dailyQuota?: number;
  }>;
  quota: {
    instant: { used: number; limit: number; remaining: number };
    connected: { total: number | 'unlimited'; byProvider: Record<string, number | 'unlimited'> };
    unlimited: boolean;
  };
  upgradePrompts: {
    shouldShow: boolean;
    available: Array<{
      provider: string;
      benefits: {
        quota: string;
        benefits: string[];
        setupTime: string;
      };
    }>;
  };
  poolStatus: {
    totalPools: number;
    availablePools: number;
    totalUsersToday: number;
  };
}

export function QuotaDisplay({ userId, onUpgrade, onConnectApiKey }: QuotaDisplayProps) {
  const [status, setStatus] = useState<AccessTierStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user access tier status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/access-tier?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch access tier status');
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (mounted && userId) {
      fetchStatus();
    }
  }, [mounted, userId]);

  // Handle provider connection
  const handleConnect = async (provider: string) => {
    try {
      const response = await fetch('/api/access-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier: 'connected',
          provider,
          connectionType: 'oauth2'
        })
      });

      const result = await response.json();
      
      if (result.success && result.authUrl) {
        // Redirect to OAuth flow
        window.location.href = result.authUrl;
      } else if (result.success && result.setupInstructions) {
        // Show API key setup
        onConnectApiKey?.(provider);
      }
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted || loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load quota information'}
        </AlertDescription>
      </Alert>
    );
  }

  // Connected users display
  if (status.currentTier === 'connected' || status.hasConnections) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <Zap className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Premium Access Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connected providers */}
            <div className="space-y-2">
              {status.connections.map((conn, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-600" />
                    <span className="font-medium capitalize">{conn.provider}</span>
                    <Badge variant="outline" className="text-xs">
                      {conn.connectionType === 'oauth2' ? 'OAuth' : 'API Key'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {conn.dailyQuota ? `${conn.dailyQuota}/day` : 'Unlimited'}
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits summary */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>60x more requests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Priority processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>No sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Advanced features</span>
              </div>
            </div>

            {/* Add more providers */}
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Connect more providers:</p>
              <div className="grid grid-cols-2 gap-2">
                {status.upgradePrompts.available
                  .filter(p => !status.connections.some(c => c.provider === p.provider))
                  .map((provider, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(provider.provider)}
                      className="text-xs"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      {provider.provider}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Instant users display with upgrade prompts
  const { instant } = status.quota;
  const utilizationPercent = Math.round((instant.used / instant.limit) * 100);
  const isNearLimit = instant.remaining <= 5;
  const isAtLimit = instant.remaining <= 0;

  return (
    <Card className={`border-orange-200 ${isNearLimit ? 'bg-orange-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Instant Access
          </Badge>
          {isNearLimit && <AlertCircle className="h-5 w-5 text-orange-500" />}
        </div>
        <CardTitle>Shared Pool Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage progress */}
          <div>
            <Progress 
              value={utilizationPercent} 
              className={`h-3 ${isNearLimit ? 'bg-orange-100' : ''}`}
            />
            <p className="mt-2 text-sm text-gray-600">
              {instant.used} / {instant.limit} requests used today
            </p>
            <p className="text-xs text-gray-500">
              {instant.remaining} requests remaining
            </p>
          </div>

          {/* Upgrade alerts */}
          {isAtLimit && (
            <Alert className="border-red-400 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Daily limit reached!</strong> Connect your provider for 1,500+ free daily requests.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isAtLimit && (
            <Alert className="border-orange-400 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Only {instant.remaining} requests left today!</strong> Connect your provider to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* Connection buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {status.upgradePrompts.available.slice(0, 2).map((provider, idx) => {
                const isGoogle = provider.provider === 'google';
                return (
                  <Button
                    key={idx}
                    onClick={() => handleConnect(provider.provider)}
                    className={`w-full ${isGoogle ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    size="sm"
                    variant={isGoogle ? 'default' : 'outline'}
                  >
                    {isGoogle ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Google ({provider.benefits.quota})
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Add {provider.provider} Key ({provider.benefits.quota})
                      </>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* More providers link */}
            {status.upgradePrompts.available.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpgrade?.('all')}
                className="w-full text-gray-600"
              >
                <Rocket className="h-4 w-4 mr-2" />
                See all providers ({status.upgradePrompts.available.length - 2} more)
              </Button>
            )}
          </div>

          {/* Benefits preview */}
          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">After connecting:</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>60x more requests (1,500+ vs 25)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Priority processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>No sharing with others</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Advanced orchestration features</span>
              </div>
            </div>
          </div>

          {/* Pool status */}
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              Shared across {status.poolStatus.totalUsersToday} users today • 
              {status.poolStatus.availablePools} of {status.poolStatus.totalPools} pools active
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}