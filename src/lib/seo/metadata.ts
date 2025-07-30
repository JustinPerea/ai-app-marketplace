import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const defaultConfig = {
  title: 'COSMARA - Your AI Universe',
  description: 'Navigate the infinite possibilities of AI with your own keys. Discover, deploy, and manage applications in your personal cosmic marketplace.',
  keywords: ['AI', 'API', 'marketplace', 'BYOK', 'applications', 'artificial intelligence', 'developers', 'cosmara', 'cosmic', 'universe'],
  image: '/images/og-image.jpg',
  url: 'https://cosmara.com',
  type: 'website' as const,
};

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const mergedConfig = { ...defaultConfig, ...config };
  
  return {
    title: mergedConfig.title,
    description: mergedConfig.description,
    keywords: mergedConfig.keywords,
    authors: mergedConfig.author ? [{ name: mergedConfig.author }] : [{ name: 'COSMARA Team' }],
    creator: 'COSMARA Team',
    publisher: 'COSMARA',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: mergedConfig.type,
      title: mergedConfig.title,
      description: mergedConfig.description,
      url: mergedConfig.url,
      siteName: 'AI App Marketplace',
      images: [
        {
          url: mergedConfig.image || defaultConfig.image,
          width: 1200,
          height: 630,
          alt: mergedConfig.title,
        },
      ],
      locale: 'en_US',
      ...(mergedConfig.type === 'article' && {
        publishedTime: mergedConfig.publishedTime,
        modifiedTime: mergedConfig.modifiedTime,
        section: mergedConfig.section,
        authors: [mergedConfig.author || 'COSMARA Team'],
        tags: mergedConfig.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: mergedConfig.title,
      description: mergedConfig.description,
      images: [mergedConfig.image || defaultConfig.image],
      creator: '@aimarketplace',
      site: '@aimarketplace',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: mergedConfig.url,
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'COSMARA',
      'mobile-web-app-capable': 'yes',
      'msapplication-config': '/browserconfig.xml',
      'msapplication-TileColor': '#0F172A',
      'theme-color': '#0F172A',
    },
  };
}

// Page-specific metadata generators
export const pageMetadata = {
  home: () => generateMetadata({
    title: 'AI App Marketplace - Your AI-Powered Application Hub',
    description: 'Discover, deploy, and manage AI applications with your own API keys. Built for everyone, trusted by enterprises, secured by design.',
    keywords: ['AI marketplace', 'BYOK', 'AI applications', 'developer platform', 'API keys'],
    url: 'https://ai-marketplace.dev',
  }),

  marketplace: (category?: string) => generateMetadata({
    title: category 
      ? `${category} AI Applications - AI App Marketplace`
      : 'Browse AI Applications - AI App Marketplace',
    description: category
      ? `Discover ${category.toLowerCase()} AI applications in our marketplace. Install and manage apps with your own API keys.`
      : 'Browse our comprehensive collection of AI applications. Install, manage, and optimize your AI workflow with BYOK security.',
    keywords: ['AI apps', 'marketplace', category, 'install apps', 'AI tools'].filter(Boolean),
    url: `https://ai-marketplace.dev/marketplace${category ? `?category=${category}` : ''}`,
  }),

  developers: () => generateMetadata({
    title: 'Developer Portal - Build AI Applications | AI App Marketplace',
    description: 'Join thousands of developers building and monetizing AI applications. Get started with our SDK, 0% commission on first $100K, and comprehensive tools.',
    keywords: ['AI development', 'developer portal', 'AI SDK', 'monetize apps', 'AI platform'],
    url: 'https://ai-marketplace.dev/developers',
  }),

  dashboard: () => generateMetadata({
    title: 'Dashboard - Manage Your AI Applications | AI App Marketplace',
    description: 'Monitor your AI applications, manage API keys, track usage, and optimize costs in your personal dashboard.',
    keywords: ['AI dashboard', 'manage apps', 'API keys', 'usage tracking'],
    url: 'https://ai-marketplace.dev/dashboard',
    robots: {
      index: false, // Private pages shouldn't be indexed
      follow: false,
    },
  }),

  app: (appName: string, appDescription: string) => generateMetadata({
    title: `${appName} - AI App Marketplace`,
    description: appDescription,
    type: 'product',
    keywords: ['AI application', appName, 'install app', 'AI tool'],
    url: `https://ai-marketplace.dev/marketplace/apps/${encodeURIComponent(appName.toLowerCase().replace(/\s+/g, '-'))}`,
  }),
};