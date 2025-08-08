'use client';

import Link from 'next/link';

export default function MarketplaceAppsPlaceholder() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Marketplace Apps</h1>
        <p className="text-gray-600 mb-6">
          Featured app pages are being refreshed. In the meantime, explore our developer docs and quick start guides.
        </p>
        <div className="flex gap-3 justify-center">
          <Link className="px-4 py-2 rounded border" href="/developers/docs">Developer Docs</Link>
          <Link className="px-4 py-2 rounded border" href="/developers/hello-world">Hello World</Link>
        </div>
      </div>
    </div>
  );
}


