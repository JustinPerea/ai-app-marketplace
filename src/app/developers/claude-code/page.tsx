'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  Copy,
  CheckCircle,
  Bot,
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Terminal,
  Zap,
  FileText,
  ExternalLink
} from 'lucide-react';

type ToolId = 'cursor' | 'claude' | 'copilot' | 'windsurf';

const TOOLS: Array<{
  id: ToolId;
  name: string;
  tagline: string;
  href: string;
  badgeClass: string; // Tailwind class for accent
}> = [
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'Agentic IDE with inline edits, chat, and composer',
    href: 'https://www.cursor.com',
    badgeClass: 'bg-blue-600/15 text-blue-400 border-blue-400/30'
  },
  {
    id: 'claude',
    name: 'Claude Code',
    tagline: 'Anthropic’s coding assistant with strong reasoning',
    href: 'https://www.anthropic.com/claude',
    badgeClass: 'bg-purple-600/15 text-purple-400 border-purple-400/30'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot Chat',
    tagline: 'VS Code/JetBrains chat with deep codebase context',
    href: 'https://github.com/features/copilot',
    badgeClass: 'bg-emerald-600/15 text-emerald-400 border-emerald-400/30'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    tagline: 'Codeium’s agentic IDE with plan-and-apply',
    href: 'https://codeium.com/windsurf',
    badgeClass: 'bg-amber-600/15 text-amber-400 border-amber-400/30'
  }
];

export default function ClaudeCodePage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('cursor');

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const basePrompt = `I want to build an AI application for the COSMARA AI App Marketplace. Here's everything you need to know:

## PLATFORM OVERVIEW
COSMARA is an AI App Marketplace with BYOK (Bring Your Own Keys) architecture that supports multiple AI providers:
- OpenAI (GPT-4o, GPT-4o-mini) - Text generation and chat
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku) - Advanced reasoning and analysis
- Google AI (Gemini 1.5 Pro, Gemini 1.5 Flash, **Gemini Veo 2**) - Text generation and **video creation**
- Cohere, Hugging Face, and local Ollama models
- **🎥 NEW: Video Generation** - Create videos from text descriptions using Gemini Veo AI

## TECHNICAL ARCHITECTURE
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with Prisma ORM
- **Authentication**: Auth0 with development bypass mode
- **Storage**: API keys encrypted in localStorage + Google Cloud KMS
- **AI Integration**: Multi-provider routing with intelligent cost optimization

## REQUIRED APP STRUCTURE
Your app must follow this structure:

\`\`\`
src/app/marketplace/[app-name]/
├── page.tsx          # Main app interface
├── api/
│   └── route.ts      # API endpoint for AI processing
└── components/       # App-specific components (optional)
\`\`\`

## ESSENTIAL IMPORTS AND PATTERNS

### 1. Page Component Structure:
\`\`\`typescript
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
// Import icons from lucide-react as needed

export default function YourAppPage() {
  // Your app logic here
  return (
      {/* Your app UI here */}
    
  );
}
\`\`\`

### 2. API Route Structure:
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input, apiKeys } = await request.json();
    
    // Your AI processing logic here
    // Use the provided API keys to make requests to AI providers
    
    return NextResponse.json({ result: 'your result' });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
\`\`\`

### 3. API Key Access Pattern:
\`\`\`typescript
// Get API keys from localStorage
const getApiKeys = () => {
  if (typeof window !== 'undefined') {
    const keys = localStorage.getItem('apiKeys');
    return keys ? JSON.parse(keys) : {};
  }
  return {};
};

// Use in your component
const apiKeys = getApiKeys();
\`\`\`

## MULTI-PROVIDER AI INTEGRATION

### Text Generation Requests:
\`\`\`typescript
// Example API call to OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKeys.openai}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: userInput }],
    max_tokens: 500,
    temperature: 0.7,
  }),
});

// Example API call to Anthropic
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKeys.anthropic,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [{ role: 'user', content: userInput }],
  }),
});

// Example API call to Google Gemini (text)
const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKeys.google}\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: userInput }] }],
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  }),
});
\`\`\`

## ERROR HANDLING BEST PRACTICES

### API Error Handling:
\`\`\`typescript
// Enhanced API route with comprehensive error handling
export async function POST(request: NextRequest) {
  try {
    const { input, apiKeys, provider } = await request.json();
    
    // Input validation
    if (!input?.trim()) {
      return NextResponse.json(
        { error: 'Input is required' }, 
        { status: 400 }
      );
    }
    
    if (!apiKeys || (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.google)) {
      return NextResponse.json(
        { error: 'At least one API key is required. Please configure your keys in Settings.' }, 
        { status: 400 }
      );
    }
    
    // Provider-specific error handling
    let response;
    try {
      if (provider === 'openai' && apiKeys.openai) {
        response = await callOpenAI(input, apiKeys.openai);
      } else if (provider === 'anthropic' && apiKeys.anthropic) {
        response = await callAnthropic(input, apiKeys.anthropic);
      } else if (provider === 'google' && apiKeys.google) {
        response = await callGoogleAI(input, apiKeys.google);
      } else {
        throw new Error(\`Provider \${provider} not configured\`);
      }
    } catch (providerError: any) {
      // Handle specific provider errors
      if (providerError.message?.includes('401') || providerError.message?.includes('unauthorized')) {
        return NextResponse.json(
          { error: \`Invalid API key for \${provider}. Please check your key in Settings.\` }, 
          { status: 401 }
        );
      }
      if (providerError.message?.includes('429') || providerError.message?.includes('rate limit')) {
        return NextResponse.json(
          { error: \`Rate limit exceeded for \${provider}. Please wait a moment and try again.\` }, 
          { status: 429 }
        );
      }
      if (providerError.message?.includes('quota') || providerError.message?.includes('billing')) {
        return NextResponse.json(
          { error: \`Quota exceeded for \${provider}. Please check your billing status.\` }, 
          { status: 402 }
        );
      }
      
      // Generic provider error
      console.error(\`\${provider} API error:\`, providerError);
      return NextResponse.json(
        { error: \`\${provider} service error. Please try again or use a different provider.\` }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json({ result: response });
    
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' }, 
      { status: 500 }
    );
  }
}
\`\`\`

### Frontend Error Handling:
\`\`\`typescript
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setError(null);
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/your-app-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, apiKeys, provider })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    // Success handling
    setResult(data.result);
    
  } catch (err: any) {
    setError(err.message || 'An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};

// Error display component
{error && (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
\`\`\`

### 🎥 VIDEO GENERATION WITH GEMINI VEO (NEW!)

\`\`\`typescript
// Generate video with Gemini Veo 2 Flash
const generateVideo = async (prompt: string, duration: number = 8) => {
  const videoRequest = {
    prompt: prompt,
    duration: duration, // 1-8 seconds
    aspectRatio: '16:9', // '16:9', '9:16', '1:1', '4:3'
    quality: 'standard', // 'standard' or 'high'
    model: 'gemini-veo-2-flash' // or 'gemini-veo-2'
  };

  // Cost estimation: $0.35 per second
  const estimatedCost = duration * 0.35;
  console.log(\`Estimated cost: \$\${estimatedCost.toFixed(3)}\`);

  // Note: This is a simplified example
  // Actual Gemini Veo API integration would require:
  // 1. Authentication with Google AI Studio
  // 2. Proper video generation endpoint
  // 3. Polling for completion status
  // 4. Video URL retrieval

  return {
    id: 'video-generation-' + Date.now(),
    status: 'processing',
    estimatedCost,
    model: videoRequest.model,
    prompt: videoRequest.prompt
  };
};

// Video generation UI component example
const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await generateVideo(prompt, duration);
      console.log('Video generation started:', result);
      // Handle result - show progress, poll for completion, etc.
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎥 AI Video Generator
          <Badge variant="secondary">Gemini Veo</Badge>
        </CardTitle>
        <CardDescription>
          Generate videos from text descriptions using Gemini Veo AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Describe your video: A beautiful sunset over mountains..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Duration: {duration}s</label>
          <input
            type="range"
            min="1"
            max="8"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Cost: \$\${(duration * 0.35).toFixed(3)}
          </span>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
\`\`\`

## UI COMPONENTS AVAILABLE
You have access to shadcn/ui components:
- Button, Card, Badge, Input, Textarea, Select, Tabs
- Dialog, Alert, Progress, Skeleton, Toast
- All Lucide React icons

## COSMIC DESIGN SYSTEM
Use these CSS classes for consistent styling:
- \`glass-card\` - Glass morphism cards
- \`glass-button-primary\` - Primary glass buttons
- \`glass-button-secondary\` - Secondary glass buttons
- \`text-glass-gradient\` - Gradient text effects
- \`bg-cosmic-gradient\` - Cosmic background gradients

## EXAMPLE APPS FOR REFERENCE
Study these existing apps:
1. **Simple AI Chat** (\`/marketplace/apps/simple-ai-chat\`) - Basic chat interface
2. **PDF Notes Generator** (\`/marketplace/apps/pdf-notes-generator\`) - File processing  
3. **Code Review Bot** (\`/marketplace/apps/code-review-bot\`) - Code analysis
4. **🎥 AI Video Generator** (\`/marketplace/apps/ai-video-generator\`) - Gemini Veo video generation (NEW!)

## APP SUBMISSION REQUIREMENTS
1. **Functionality**: App must work with user's own API keys
2. **Error Handling**: Proper error messages and validation
3. **UI Consistency**: Follow the cosmic design system
4. **Performance**: Optimize for fast loading and responsiveness
5. **Documentation**: Clear instructions for users

## TESTING YOUR APP
1. Navigate to \`http://localhost:3000/marketplace/your-app-name\`
2. Test with valid API keys from the setup page
3. Verify error handling with invalid keys
4. Test responsive design on different screen sizes

## DEPLOYMENT
Apps are automatically available once you create the files in the correct structure. No separate deployment step needed.

---

Now, please help me build: [DESCRIBE YOUR APP IDEA HERE]

Make sure to:
1. Create the page.tsx file with proper UI
2. Create the API route for AI processing
3. Implement proper error handling
4. Follow the cosmic design system
5. Test the functionality

Let's start building!`;

  const minimalPrompt = `You are an expert Next.js engineer. Using this repository, help me scaffold and ship a production-quality AI app for the COSMARA AI App Marketplace.

Goals:
- Create a new app page under src/app/marketplace/[my-app]/page.tsx with a simple UI
- Add an API route under src/app/marketplace/[my-app]/api/route.ts that calls one provider (OpenAI/Anthropic/Google)
- Use existing components (shadcn/ui) and follow the cosmic design
- Read /src/lib and /src/app/api for existing patterns
- Add clear error handling and provider-key checks (use /setup flow)

Deliverables:
1) Initial UI + endpoint
2) Validation + error messages
3) Short README instructions
4) Notes on how to switch providers later`;

  const activeToolData = TOOLS.find(t => t.id === activeTool)!;
  const fullPrompt = basePrompt; // Base prompt works across tools; UI text adapts per tool

  // Persist tool selection across visits
  useEffect(() => {
    try {
      const saved = localStorage.getItem('devToolChoice') as ToolId | null;
      if (saved && TOOLS.some(t => t.id === saved)) {
        setActiveTool(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('devToolChoice', activeTool);
    } catch {}
  }, [activeTool]);

  return (
    <>
      {/* Background Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <SimpleStars />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(16, 185, 129, 0.08) 100%)'
             }}>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6 ${activeToolData.badgeClass}`}>
              <Bot className="h-3 w-3 mr-2" />
              <span className="text-sm font-medium text-text-primary">AI Coding Tools</span>
            </div>

            {/* Tool Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  aria-pressed={activeTool === tool.id}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    activeTool === tool.id
                      ? `${tool.badgeClass}`
                      : 'border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                  }`}
                >
                  {tool.name}
                </button>
              ))}
            </div>

            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">Build with</span>
              <br />
              <span className="text-stardust-muted">{activeToolData.name}</span>
            </h1>

            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Copy the comprehensive prompt below and paste it into {activeToolData.name} to build your AI app
              with platform context, architecture patterns, and working examples.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="glass-button-primary"
                onClick={() => copyToClipboard(fullPrompt, 'full-prompt')}
              >
                {copiedSection === 'full-prompt' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Full Prompt for {activeToolData.name}
                  </>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="glass-button-secondary"
                onClick={() => copyToClipboard(minimalPrompt, 'minimal-prompt')}
              >
                {copiedSection === 'minimal-prompt' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Minimal Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Minimal Prompt
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary" asChild>
                <Link href={activeToolData.href} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open {activeToolData.name}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-text-primary text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Copy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-h3 text-text-primary">1. Copy Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Copy the comprehensive prompt that includes all platform architecture, 
                  API patterns, and component examples.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-h3 text-text-primary">2. Paste to {activeToolData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Paste the prompt into {activeToolData.name} and describe your app idea. 
                  The assistant will have complete context to build properly.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-h3 text-text-primary">3. Build & Deploy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Claude Code will create your app with proper structure, 
                  AI integration, and cosmic design. Test and iterate as needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Full Prompt Display */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-h2 text-text-primary flex items-center gap-3">
                    <Terminal className="h-6 w-6" />
                    Complete {activeToolData.name} Prompt
                  </CardTitle>
                  <CardDescription className="text-body text-text-secondary">
                    Copy this entire prompt and paste it into {activeToolData.name} to get started
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => copyToClipboard(fullPrompt, 'main-prompt')}
                    className="glass-button-primary"
                  >
                    {copiedSection === 'main-prompt' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt for {activeToolData.name}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-button-secondary"
                    onClick={() => copyToClipboard(minimalPrompt, 'main-minimal')}
                  >
                    {copiedSection === 'main-minimal' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Minimal Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Minimal Prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                  {fullPrompt}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick setup for selected tool */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-h3 text-text-primary">Quick setup: {activeToolData.name}</CardTitle>
              <CardDescription className="text-body text-text-secondary">Recommended steps to use this prompt effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                {activeTool === 'cursor' && (
                  <>
                    <li>Install Cursor and sign in. Open this repository.</li>
                    <li>Open Chat (Cmd+L) or Composer, paste the prompt, then describe your app.</li>
                    <li>Use inline edits and diffs to apply changes; iterate in small steps.</li>
                    <li>
                      Read the docs:
                      {' '}<Link href="https://docs.cursor.com" target="_blank" rel="noreferrer" className="underline">Cursor Docs</Link>
                      {' '}·{' '}
                      <Link href="https://www.cursor.com" target="_blank" rel="noreferrer" className="underline">Cursor Website</Link>
                    </li>
                  </>
                )}
                {activeTool === 'claude' && (
                  <>
                    <li>Open Claude (web or desktop) and start a new coding session.</li>
                    <li>Paste the prompt; grant file access or paste relevant files when asked.</li>
                    <li>Ask Claude to scaffold the app structure and implement endpoints.</li>
                  </>
                )}
                {activeTool === 'copilot' && (
                  <>
                    <li>Open VS Code with GitHub Copilot Chat enabled.</li>
                    <li>Open Command Palette (Cmd+Shift+P) → search “Copilot: Open Chat” and open the Chat view.</li>
                    <li>Paste the prompt and provide repo context (files/paths or code blocks).</li>
                    <li>Use Copilot Chat actions like “Explain this”, “Fix”, and “Generate tests”. Review diffs before accepting.</li>
                  </>
                )}
                {activeTool === 'windsurf' && (
                  <>
                    <li>Open Windsurf and create a new session in your repo.</li>
                    <li>Paste the prompt and let the agent plan; review the plan before apply.</li>
                    <li>Apply in stages and keep commits small and descriptive.</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-text-primary text-center mb-16">What's Included</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <Code2 className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-h4 text-text-primary">Complete Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Full Next.js app structure, API patterns, and component imports
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle className="text-h4 text-text-primary">AI Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Multi-provider AI setup with OpenAI, Anthropic, Google, and more
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-h4 text-text-primary">Design System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Cosmic design patterns with glass morphism and gradient effects
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <FileText className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-h4 text-text-primary">Working Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Reference implementations and proven code patterns
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.10) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.10) 100%)'
             }}>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="glass-card p-12 text-center">
            <h2 className="text-hero-glass mb-6">
              Ready to Build with {activeToolData.name}?
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
              Copy the prompt above and start building your AI app with complete platform knowledge. 
              Your AI coding assistant will guide you through each step of the process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="glass-button-primary"
                onClick={() => copyToClipboard(fullPrompt, 'cta-prompt')}
              >
                {copiedSection === 'cta-prompt' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Complete Prompt for {activeToolData.name}
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary" asChild>
                <a href="/developers/quick-start">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Manual Setup Guide
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}