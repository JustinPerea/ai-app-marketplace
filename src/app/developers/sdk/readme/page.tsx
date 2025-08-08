import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function SDKReadmePage() {
  let content = '# SDK README\n\nFile not found.';
  try {
    const readmePath = path.resolve(process.cwd(), 'packages/sdk/README.md');
    content = fs.readFileSync(readmePath, 'utf8');
  } catch (e) {
    // ignore; show fallback
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">SDK README</h1>
        <Link href="/developers/docs" className="underline text-text-secondary hover:text-text-primary">Back to Docs</Link>
      </div>
      <div className="glass-card p-4 border rounded-md overflow-x-auto">
        <pre className="whitespace-pre-wrap text-sm leading-6">{content}</pre>
      </div>
    </div>
  );
}



