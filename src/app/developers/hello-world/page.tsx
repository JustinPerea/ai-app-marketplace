'use client';

import Link from 'next/link';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, FilePlus, ArrowRight, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

export default function HelloWorldScaffoldPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const pageCode = `import { useState } from 'react';

export default function MyAppPage() {
  const [input, setInput] = useState('world');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch('/marketplace/my-app/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Hello World</h1>
      <input className="border rounded px-3 py-2 w-full mb-3" value={input} onChange={e => setInput(e.target.value)} />
      <button className="border rounded px-4 py-2" onClick={run} disabled={loading}>{loading ? 'Running...' : 'Run'}</button>
      {result && <div className="mt-4">Result: {result}</div>}
    </div>
  );
}`;

  const apiCode = `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }
    return NextResponse.json({ result: 'Hello ' + input + '!' });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
`;

  const steps = [
    { file: 'src/app/marketplace/my-app/page.tsx', code: pageCode },
    { file: 'src/app/marketplace/my-app/api/route.ts', code: apiCode }
  ];

  return (
    <CosmicPageLayout starCount={40} parallaxSpeed={0.25} gradientOverlay="none">
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-4">
              <Code2 className="h-3 w-3 mr-2" />
              <span className="text-sm font-medium text-text-primary">Scaffold</span>
            </div>
            <h1 className="text-hero-glass mb-4">Hello World Template</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Create two files and you’re done. Works with any provider keys you’ve connected.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <FilePlus className="h-5 w-5" /> {s.file}
                  </CardTitle>
                  <CardDescription className="text-text-secondary">Copy this into your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 text-green-400 text-xs sm:text-sm font-mono overflow-x-auto">
                    <pre>{s.code}</pre>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => copy(s.code, s.file)}>
                      {copied === s.file ? <><CheckCircle className="h-4 w-4 mr-1" />Copied</> : <><Copy className="h-4 w-4 mr-1" />Copy</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild className="glass-button-primary">
              <Link href="/developers/getting-started">Back to Getting Started <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </CosmicPageLayout>
  );
}



