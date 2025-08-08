'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Code2, 
  Zap,
  Book,
  Download,
  ExternalLink
} from 'lucide-react';

export default function QuickStartPage() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const installCommand = 'npm install @cosmara-ai/community-sdk';
  
  const basicExample = `import { CosmARAClient } from '@cosmara-ai/community-sdk';

// Initialize the client
const client = new CosmARAClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY
  }
});

// Send a message
async function chatWithAI() {
  try {
    const response = await client.chat({
      messages: [
        { role: 'user', content: 'Hello! Tell me about AI.' }
      ]
    }, { provider: 'openai' }); // or 'anthropic', 'google'
    
    console.log(response.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

chatWithAI();`;

  const envExample = `# COSMARA AI App Environment Variables
# Copy this to .env and add your actual API keys
# IMPORTANT: Never commit .env files to version control!

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key_here

# Anthropic API Key (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your_anthropic_key_here  

# Google AI API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=your_google_ai_key_here`;

  const videoExample = `// Generate videos with Gemini Veo
import { GoogleProvider } from '@cosmara-ai/community-sdk';

const provider = new GoogleProvider();

async function generateVideo() {
  const videoRequest = {
    prompt: 'A beautiful sunset over mountains',
    duration: 8,
    aspectRatio: '16:9',
    quality: 'standard',
    model: 'gemini-veo-2-flash'
  };

  try {
    const response = await provider.generateVideo(videoRequest, apiKey);
    console.log('Video generation started:', response.id);
    
    // Poll for completion
    const completedVideo = await provider.pollVideoCompletion(response.id, apiKey);
    console.log('Video ready:', completedVideo.videoUrl);
  } catch (error) {
    console.error('Video generation failed:', error);
  }
}`;

  return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold">Quick Start Guide</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with the COSMARA AI SDK in minutes. Build AI-powered applications 
            with multi-provider support and intelligent cost optimization.
          </p>
        </div>

        {/* Prerequisites */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prerequisites:</strong> Node.js 16+, npm or yarn, and at least one AI provider API key 
            (OpenAI, Anthropic, or Google AI).
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Step 1: Installation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Install the SDK
              </CardTitle>
              <CardDescription>
                Install the COSMARA AI Community SDK from npm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <code className="text-green-400 font-mono">{installCommand}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(installCommand, 1)}
                >
                  {copiedStep === 1 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Environment Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Set Up Environment Variables
              </CardTitle>
              <CardDescription>
                Create a .env file with your API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                  {envExample}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(envExample, 2)}
                >
                  {copiedStep === 2 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Get your API keys:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      OpenAI API Keys
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Anthropic Console
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Google AI Studio
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Basic Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Your First AI Chat
              </CardTitle>
              <CardDescription>
                Send your first message using the SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                  {basicExample}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(basicExample, 3)}
                >
                  {copiedStep === 3 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Video Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Video Generation (New!)
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Gemini Veo
                </Badge>
              </CardTitle>
              <CardDescription>
                Generate videos from text descriptions using Gemini Veo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                  {videoExample}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(videoExample, 4)}
                >
                  {copiedStep === 4 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Video generation requires a Google AI API key and costs $0.35 per second of video generated.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-6 w-6 text-green-500" />
                Next Steps
              </CardTitle>
              <CardDescription>
                Continue your journey with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 text-left" asChild>
                  <a href="/developers/documentation">
                    <div>
                      <div className="font-semibold">Full Documentation</div>
                      <div className="text-sm text-muted-foreground">
                        Complete API reference and guides
                      </div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto p-4 text-left" asChild>
                  <a href="/developers/examples">
                    <div>
                      <div className="font-semibold">Code Examples</div>
                      <div className="text-sm text-muted-foreground">
                        Ready-to-use code snippets
                      </div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto p-4 text-left" asChild>
                  <a href="/marketplace/apps/simple-ai-chat">
                    <div>
                      <div className="font-semibold">Try the Demo</div>
                      <div className="text-sm text-muted-foreground">
                        Test your API keys in our chat app
                      </div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto p-4 text-left" asChild>
                  <a href="/marketplace/apps/ai-video-generator">
                    <div>
                      <div className="font-semibold">Video Demo</div>
                      <div className="text-sm text-muted-foreground">
                        Try video generation with Gemini Veo
                      </div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Multi-Provider</h3>
                <p className="text-sm text-muted-foreground">
                  Switch between OpenAI, Anthropic, Google AI, and local models
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Code2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Type Safe</h3>
                <p className="text-sm text-muted-foreground">
                  Full TypeScript support with intelligent autocomplete
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Cost Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic cost comparison and intelligent routing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
}