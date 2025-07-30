import { AppCategory, AppPricing, ApiProvider, UserPlan } from '@prisma/client';

// Application Constants
export const APP_NAME = 'AI App Marketplace';
export const APP_DESCRIPTION = 'Your AI-powered application marketplace with BYOK support';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Plan Limits
export const PLAN_LIMITS = {
  FREE: {
    apiKeys: 2,
    appSubscriptions: 5,
    monthlyRequests: 1000,
  },
  PRO: {
    apiKeys: 10,
    appSubscriptions: 50,
    monthlyRequests: 50000,
  },
  TEAM: {
    apiKeys: 25,
    appSubscriptions: 200,
    monthlyRequests: 200000,
  },
  ENTERPRISE: {
    apiKeys: -1, // unlimited
    appSubscriptions: -1, // unlimited
    monthlyRequests: -1, // unlimited
  },
} as const;

// App Category Labels
export const CATEGORY_LABELS: Record<AppCategory, string> = {
  PRODUCTIVITY: 'Productivity',
  CONTENT_CREATION: 'Content Creation',
  DATA_ANALYSIS: 'Data Analysis',
  EDUCATION: 'Education',
  ENTERTAINMENT: 'Entertainment',
  BUSINESS: 'Business',
  DEVELOPER_TOOLS: 'Developer Tools',
  UTILITIES: 'Utilities',
  OTHER: 'Other',
};

// Pricing Model Labels
export const PRICING_LABELS: Record<AppPricing, string> = {
  FREE: 'Free',
  FREEMIUM: 'Freemium',
  PAID: 'Paid',
  ENTERPRISE: 'Enterprise',
};

// API Provider Labels
export const PROVIDER_LABELS: Record<ApiProvider, string> = {
  OPENAI: 'OpenAI',
  ANTHROPIC: 'Anthropic',
  GOOGLE: 'Google AI',
  AZURE_OPENAI: 'Azure OpenAI',
  COHERE: 'Cohere',
  HUGGING_FACE: 'Hugging Face',
};

// User Plan Labels
export const PLAN_LABELS: Record<UserPlan, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  TEAM: 'Team',
  ENTERPRISE: 'Enterprise',
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxScreenshots: 5,
};

// API Rate Limits (requests per minute)
export const RATE_LIMITS = {
  FREE: 60,
  PRO: 300,
  TEAM: 1000,
  ENTERPRISE: 5000,
};

// Security
export const PASSWORD_MIN_LENGTH = 8;
export const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

// URLs
export const EXTERNAL_URLS = {
  DOCS: 'https://docs.aiappmarketplace.com',
  SUPPORT: 'https://support.aiappmarketplace.com',
  GITHUB: 'https://github.com/aiappmarketplace',
  TWITTER: 'https://twitter.com/aiappmarketplace',
} as const;