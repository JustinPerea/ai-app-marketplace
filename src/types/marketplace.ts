import {
  AppCategory,
  AppPricing,
  AppStatus,
  ApiProvider,
  SubscriptionStatus,
  UserPlan,
} from '@prisma/client';

// Marketplace App Types
export interface MarketplaceAppWithDeveloper {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: AppCategory;
  tags: string[];
  version: string;
  pricing: AppPricing;
  price?: number;
  isActive: boolean;
  isFeatured: boolean;
  iconUrl?: string;
  screenshotUrls: string[];
  demoUrl?: string;
  githubUrl?: string;
  requiredProviders: ApiProvider[];
  downloadCount: number;
  activeUsers: number;
  averageRating?: number;
  reviewCount: number;
  status: AppStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  developer: {
    displayName: string;
    verified: boolean;
  };
}

// API Response Types
export interface AppsResponse {
  apps: MarketplaceAppWithDeveloper[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface UserProfile {
  id: string;
  auth0Id: string;
  email: string;
  name?: string;
  image?: string;
  plan: UserPlan;
  bio?: string;
  company?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  mfaEnabled: boolean;
  role: 'user' | 'developer' | 'admin';
}

// API Key Types
export interface ApiKeyInfo {
  id: string;
  name: string;
  provider: ApiProvider;
  keyPreview: string;
  isActive: boolean;
  lastUsed?: Date;
  totalRequests: number;
  totalCost: number;
  createdAt: Date;
}

// Subscription Types
export interface AppSubscriptionInfo {
  id: string;
  appId: string;
  appName: string;
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

// Filter Types
export interface AppFilters {
  category?: AppCategory;
  pricing?: AppPricing;
  featured?: boolean;
  search?: string;
  tags?: string[];
}

// Developer Types
export interface DeveloperProfileInfo {
  id: string;
  displayName: string;
  description?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  verified: boolean;
  totalApps: number;
  totalDownloads: number;
  averageRating?: number;
  totalEarnings: number;
}

// Usage Analytics Types
export interface UsageAnalytics {
  totalRequests: number;
  totalCost: number;
  requestsByProvider: Record<ApiProvider, number>;
  costsByProvider: Record<ApiProvider, number>;
  requestsByDay: Array<{
    date: string;
    requests: number;
    cost: number;
  }>;
}

// Constants
export const APP_CATEGORIES = Object.values(AppCategory);
export const APP_PRICING_MODELS = Object.values(AppPricing);
export const API_PROVIDERS = Object.values(ApiProvider);
export const USER_PLANS = Object.values(UserPlan);