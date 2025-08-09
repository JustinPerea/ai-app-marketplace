import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-static';

function CodeBlock({ inline, className, children }: { inline?: boolean; className?: string; children: React.ReactNode }) {
  if (inline) {
    return <code className="px-1 py-0.5 rounded bg-white/10 text-stardust text-[0.9em]">{children}</code>;
  }
  return (
    <div className="glass-card bg-deep-space/80 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-glass-border my-4">
      <pre className="text-stardust leading-6">{children}</pre>
    </div>
  );
}

export default function SDKReadmePage() {
  let content = '# SDK README\n\nFile not found.';
  try {
    // Prefer the README from the installed npm package to avoid exposing local source
    const nodeModulesReadme = path.resolve(
      process.cwd(),
      'node_modules/@cosmara-ai/community-sdk/README.md'
    );
    if (fs.existsSync(nodeModulesReadme)) {
      content = fs.readFileSync(nodeModulesReadme, 'utf8');
    } else {
      // Fallback to local if present (e.g., in private dev)
      const readmePath = path.resolve(process.cwd(), 'packages/sdk/README.md');
      content = fs.readFileSync(readmePath, 'utf8');
    }
  } catch (e) {
    // ignore; show fallback
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">SDK README</h1>
        <Link href="/developers/docs" className="underline text-text-secondary hover:text-text-primary">Back to Docs</Link>
      </div>

      <article className="glass-card p-6 rounded-xl border border-glass-border">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-h1 text-text-primary mt-6 mb-3">{children}</h1>,
            h2: ({ children }) => <h2 className="text-h2 text-text-primary mt-8 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-text-secondary leading-7 mb-4">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4 text-text-secondary">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-text-secondary">{children}</ol>,
            li: ({ children }) => <li className="text-text-secondary">{children}</li>,
            a: ({ children, href }) => <a href={href} className="underline text-glass-gradient hover:opacity-90" target="_blank" rel="noreferrer">{children}</a>,
            table: ({ children }) => (
              <div className="overflow-x-auto border border-white/10 rounded-lg my-4">
                <table className="min-w-full text-sm text-text-secondary">{children}</table>
              </div>
            ),
            th: ({ children }) => <th className="bg-white/5 px-3 py-2 text-left text-text-primary">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border-t border-white/10">{children}</td>,
            code: ({ inline, className, children }) => (
              <CodeBlock inline={inline} className={className}>{children}</CodeBlock>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}



