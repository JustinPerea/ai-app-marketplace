/**
 * Install App Modal Component
 * 
 * Provides a confirmation modal for app installation with:
 * - App information display
 * - Requirements and prerequisites
 * - Installation confirmation
 * - Loading states and error handling
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Key,
  Shield,
  Zap,
  Star,
  Users,
  ArrowRight
} from 'lucide-react';

export interface AppInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  installs: string;
  price: string;
  featured?: boolean;
  verified?: boolean;
  tags: string[];
  publisher: string;
  providers?: string[];
  requirements?: string[];
}

interface InstallAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: AppInfo | null;
  isInstalling: boolean;
  onInstall: (appId: string) => Promise<boolean>;
  onSuccess?: () => void;
}

export function InstallAppModal({
  open,
  onOpenChange,
  app,
  isInstalling,
  onInstall,
  onSuccess,
}: InstallAppModalProps) {
  const [installationStep, setInstallationStep] = useState<'confirm' | 'installing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInstall = async () => {
    if (!app) return;

    setInstallationStep('installing');
    setErrorMessage('');

    try {
      const success = await onInstall(app.id);
      
      if (success) {
        setInstallationStep('success');
        // Auto-close after success
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
          setInstallationStep('confirm');
        }, 2000);
      } else {
        setInstallationStep('error');
        setErrorMessage('Installation failed. Please try again.');
      }
    } catch (error) {
      console.error('Installation error:', error);
      setInstallationStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleClose = () => {
    if (installationStep !== 'installing') {
      onOpenChange(false);
      setInstallationStep('confirm');
      setErrorMessage('');
    }
  };

  const getRequirements = () => {
    if (!app) return [];
    
    const requirements = app.requirements || [];
    
    // Add provider-specific requirements
    if (app.providers) {
      const cloudProviders = app.providers.filter(p => p !== 'LOCAL');
      if (cloudProviders.length > 0) {
        requirements.push(`API keys for: ${cloudProviders.join(', ')}`);
      }
    }
    
    return requirements;
  };

  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            {installationStep === 'confirm' && 'Install Application'}
            {installationStep === 'installing' && 'Installing...'}
            {installationStep === 'success' && 'Installation Complete!'}
            {installationStep === 'error' && 'Installation Failed'}
          </DialogTitle>
          <DialogDescription>
            {installationStep === 'confirm' && `Review the details below and confirm installation of ${app.name}`}
            {installationStep === 'installing' && 'Please wait while we install the application...'}
            {installationStep === 'success' && 'The application has been successfully installed and is ready to use'}
            {installationStep === 'error' && 'There was a problem installing the application'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* App Information */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{app.name}</h3>
                    {app.verified && (
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {app.featured && (
                      <Badge variant="default" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{app.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{app.installs}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-primary">{app.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publisher Info */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Publisher</span>
                  <span className="font-medium">{app.publisher}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">{app.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Providers */}
          {app.providers && app.providers.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Supported AI Providers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {app.providers.map((provider) => (
                    <Badge key={provider} variant="secondary" className="text-xs">
                      {provider === 'LOCAL' ? '🏠 Local AI' : 
                       provider === 'OPENAI' ? '🤖 OpenAI' :
                       provider === 'ANTHROPIC' ? '🔮 Claude' :
                       provider === 'GOOGLE' ? '🟡 Gemini' : provider}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {getRequirements().length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Requirements
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {getRequirements().map((requirement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {requirement}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  💡 You can add API keys in Settings after installation
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-green-900 mb-1">Privacy & Security</div>
                  <div className="text-green-700">
                    Your API keys and data remain under your control. This app follows our BYOK (Bring Your Own Keys) architecture.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Status */}
          {installationStep === 'installing' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Installing {app.name}</div>
                    <div className="text-sm text-blue-700">Setting up subscription and configuring access...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {installationStep === 'success' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Successfully Installed!</div>
                    <div className="text-sm text-green-700">You can now access {app.name} from your dashboard</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {installationStep === 'error' && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-900">Installation Failed</div>
                    <div className="text-sm text-red-700">{errorMessage}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          {installationStep === 'confirm' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleInstall} disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>
            </>
          )}

          {installationStep === 'installing' && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Installing...
            </Button>
          )}

          {installationStep === 'success' && (
            <Button onClick={() => onSuccess?.()} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          )}

          {installationStep === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setInstallationStep('confirm')}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}