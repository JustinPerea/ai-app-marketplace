'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { BackToMarketplace } from '@/components/ui/back-to-marketplace';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProviderRequiredNotice } from '@/components/ui/provider-required-notice';
import { 
  Play, 
  Video, 
  Settings, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Download,
  Clock,
  DollarSign,
  Zap,
  Sparkles
} from 'lucide-react';
import { APIKeyManager } from '@/lib/api-keys-hybrid';

interface VideoGeneration {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  cost: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
}

interface VideoModel {
  id: string;
  name: string;
  displayName: string;
  costPerSecond: number;
  description: string;
}

const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'gemini-veo-2-flash',
    name: 'gemini-veo-2-flash',
    displayName: 'Gemini Veo 2 Flash',
    costPerSecond: 0.35,
    description: 'Fast video generation for quick prototyping'
  },
  {
    id: 'gemini-veo-2',
    name: 'gemini-veo-2',
    displayName: 'Gemini Veo 2',
    costPerSecond: 0.35,
    description: 'High-quality video generation for production'
  }
];

const ASPECT_RATIOS = [
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Classic (4:3)' }
];

export default function AIVideoGeneratorApp() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-veo-2-flash');
  const [duration, setDuration] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [quality, setQuality] = useState<string>('standard');
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Check Google AI connection status
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const keys = await APIKeyManager.getAll();
      const googleKey = keys.find((key: any) => key.provider === 'GOOGLE' && key.isActive);
      setIsGoogleConnected(!!googleKey);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setIsGoogleConnected(false);
    }
  };

  const estimateCost = () => {
    const model = VIDEO_MODELS.find(m => m.id === selectedModel);
    return model ? (duration * model.costPerSecond) : 0;
  };

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video description');
      return;
    }

    if (!isGoogleConnected) {
      setError('Please configure your Google AI API key in Settings');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a new generation record
      const newGeneration: VideoGeneration = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        status: 'pending',
        model: selectedModel,
        duration,
        aspectRatio,
        cost: estimateCost(),
        createdAt: new Date(),
        progress: 0,
        estimatedTimeRemaining: 180 // 3 minutes average
      };

      setGenerations(prev => [newGeneration, ...prev]);

      // API call would go here - for now we'll simulate the process
      // const response = await fetch('/api/video/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     prompt: prompt.trim(),
      //     model: selectedModel,
      //     duration,
      //     aspectRatio,
      //     quality
      //   })
      // });

      // Simulate video generation progress
      simulateVideoGeneration(newGeneration.id);

      setPrompt('');
    } catch (error) {
      console.error('Video generation failed:', error);
      setError('Failed to generate video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate video generation process for demo
  const simulateVideoGeneration = (generationId: string) => {
    let progress = 0;
    let timeRemaining = 180;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      timeRemaining -= 5;

      if (progress >= 100) {
        progress = 100;
        timeRemaining = 0;
        
        setGenerations(prev => prev.map(gen => 
          gen.id === generationId 
            ? { 
                ...gen, 
                status: 'completed',
                progress: 100,
                estimatedTimeRemaining: 0,
                completedAt: new Date(),
                videoUrl: '/api/placeholder-video.mp4',
                thumbnailUrl: '/api/placeholder-thumbnail.jpg'
              }
            : gen
        ));
        
        clearInterval(interval);
      } else {
        setGenerations(prev => prev.map(gen => 
          gen.id === generationId 
            ? { 
                ...gen, 
                status: 'processing',
                progress: Math.min(progress, 99),
                estimatedTimeRemaining: Math.max(timeRemaining, 5)
              }
            : gen
        ));
      }
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <CosmicPageLayout gradientOverlay="purple">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation with Breadcrumbs */}
        <BackToMarketplace 
          appName="AI Video Generator"
          categoryName="Content Creation"
          categorySlug="CONTENT_CREATION"
          showBreadcrumbs={true}
        />
        
        {/* Header */}
        <CosmicPageHeader 
          icon={Video}
          title="AI Video Generator"
          subtitle="Create stunning videos from text descriptions using Gemini Veo AI. Generate up to 8-second videos in multiple aspect ratios."
          accentIcon={Sparkles}
          maxWidth="2xl"
        />

        {/* Connection Status */}
        {!isGoogleConnected && (
          <ProviderRequiredNotice
            className="mb-6"
            providerIds={["GOOGLE"]}
            message="Google AI API key required for video generation."
          />
        )}

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Form */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Video Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure your video generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Video Description
                  </label>
                  <Input
                    placeholder="A beautiful sunset over mountains..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {prompt.length}/2000 characters
                  </p>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    {VIDEO_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.displayName} (${model.costPerSecond}/sec)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Duration: {duration} seconds
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <option key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Cost Estimate */}
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Estimated Cost:</span>
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${estimateCost().toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateVideo}
                  disabled={isLoading || !isGoogleConnected || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Videos */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Generated Videos</CardTitle>
                <CardDescription className="text-gray-400">
                  Your video generation history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generations.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No videos generated yet</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Enter a description and click Generate Video to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generations.map((generation) => (
                      <div
                        key={generation.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-white font-medium mb-1">
                              {generation.prompt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{generation.model}</span>
                              <span>{generation.duration}s</span>
                              <span>{generation.aspectRatio}</span>
                              <span>${generation.cost.toFixed(3)}</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              generation.status === 'completed' ? 'default' :
                              generation.status === 'failed' ? 'destructive' :
                              'secondary'
                            }
                            className={
                              generation.status === 'completed' ? 'bg-green-600' :
                              generation.status === 'failed' ? 'bg-red-600' :
                              'bg-blue-600'
                            }
                          >
                            {generation.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {generation.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {generation.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {generation.status}
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        {(generation.status === 'pending' || generation.status === 'processing') && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                              <span>Progress: {generation.progress || 0}%</span>
                              {generation.estimatedTimeRemaining && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(generation.estimatedTimeRemaining)} remaining
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${generation.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Video Player */}
                        {generation.status === 'completed' && generation.videoUrl && (
                          <div className="mt-3">
                            <div className="bg-gray-900 rounded-lg p-4 aspect-video flex items-center justify-center">
                              <div className="text-center">
                                <Play className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">
                                  Video player would appear here
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {generation.videoUrl}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Button size="sm" variant="outline" className="border-gray-600">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline" className="border-gray-600">
                                <Play className="h-4 w-4 mr-1" />
                                Play
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {generation.status === 'failed' && generation.error && (
                          <Alert className="mt-3 border-red-500 bg-red-500/10">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-400">
                              {generation.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400" />
                <div>
                  <h3 className="text-white font-medium">Fast Generation</h3>
                  <p className="text-sm text-gray-400">Videos ready in ~3 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">Multiple Formats</h3>
                  <p className="text-sm text-gray-400">16:9, 9:16, 1:1, 4:3 ratios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="text-white font-medium">Transparent Pricing</h3>
                  <p className="text-sm text-gray-400">Pay per second generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CosmicPageLayout>
  );
}