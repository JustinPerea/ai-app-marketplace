'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
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
  FileText
} from 'lucide-react';

export default function ClaudeCodePage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const fullPrompt = `I want to build an AI application for the COSMARA AI App Marketplace. Here's everything you need to know:

## PLATFORM OVERVIEW
COSMARA is an AI App Marketplace with BYOK (Bring Your Own Keys) architecture that supports multiple AI providers:
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku)
- Google AI (Gemini 1.5 Pro, Gemini 1.5 Flash)
- Cohere, Hugging Face, and local Ollama models

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
    <MainLayout>
      {/* Your app UI here */}
    </MainLayout>
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

### Making AI Requests:
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
1. **Simple AI Chat** (\`/marketplace/simple-ai-chat\`) - Basic chat interface
2. **PDF Notes Generator** (\`/marketplace/pdf-notes-generator\`) - File processing
3. **Code Review Bot** (\`/marketplace/code-review-bot\`) - Code analysis

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

  return (
    <MainLayout>
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
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
                 style={{
                   background: 'rgba(139, 92, 246, 0.1)',
                   borderColor: 'rgba(139, 92, 246, 0.3)'
                 }}>
              <Bot className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
              <span className="text-sm font-medium text-text-primary">Claude Code Integration</span>
            </div>

            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">Build with</span>
              <br />
              <span className="text-stardust-muted">Claude Code</span>
            </h1>

            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Copy the comprehensive prompt below and paste it into Claude Code to build your AI app 
              with complete platform knowledge, architecture patterns, and working examples.
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
                    Copy Full Prompt
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary" asChild>
                <a href="/developers/examples">
                  <BookOpen className="h-5 w-5 mr-2" />
                  View Examples
                </a>
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
                <CardTitle className="text-h3 text-text-primary">2. Paste to Claude</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-text-secondary">
                  Paste the prompt into Claude Code and describe your app idea. 
                  Claude will have complete context to build properly.
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
                    Complete Claude Code Prompt
                  </CardTitle>
                  <CardDescription className="text-body text-text-secondary">
                    Copy this entire prompt and paste it into Claude Code to get started
                  </CardDescription>
                </div>
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
                      Copy Prompt
                    </>
                  )}
                </Button>
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
              Ready to Build with Claude Code?
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
              Copy the prompt above and start building your AI app with complete platform knowledge. 
              Claude Code will guide you through every step of the development process.
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
                    Copy Complete Prompt
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
    </MainLayout>
  );
}