// Structured data (JSON-LD) generation for SEO
import React from 'react';

interface Organization {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage: string;
  };
}

interface WebSite {
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface SoftwareApplication {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
}

interface Article {
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: Organization;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  image: string[];
}

function createStructuredData(data: any) {
  return {
    '@context': 'https://schema.org',
    ...data,
  };
}

export function generateOrganizationSchema(): Organization {
  return createStructuredData({
    '@type': 'Organization',
    name: 'AI App Marketplace',
    url: 'https://ai-marketplace.dev',
    logo: 'https://ai-marketplace.dev/images/logo.png',
    sameAs: [
      'https://twitter.com/aimarketplace',
      'https://github.com/aimarketplace',
      'https://linkedin.com/company/aimarketplace'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-AI-APPS',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  });
}

export function generateWebSiteSchema(): WebSite {
  return createStructuredData({
    '@type': 'WebSite',
    name: 'AI App Marketplace',
    url: 'https://ai-marketplace.dev',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ai-marketplace.dev/marketplace?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  });
}

export function generateAppSchema(app: {
  name: string;
  description: string;
  url: string;
  category: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  author: string;
  authorType?: 'Person' | 'Organization';
}): SoftwareApplication {
  return createStructuredData({
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: app.category,
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: app.price.toString(),
      priceCurrency: app.currency
    },
    ...(app.rating && app.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: app.rating,
        reviewCount: app.reviewCount
      }
    }),
    author: {
      '@type': app.authorType || 'Person',
      name: app.author
    }
  });
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate: string;
  url: string;
  images: string[];
}): Article {
  return createStructuredData({
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: generateOrganizationSchema(),
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    mainEntityOfPage: article.url,
    image: article.images
  });
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return createStructuredData({
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  });
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return createStructuredData({
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  });
}

// Helper function to inject structured data into page
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}