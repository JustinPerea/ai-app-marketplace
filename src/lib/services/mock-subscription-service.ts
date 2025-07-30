/**
 * Mock Subscription Service
 * 
 * Provides in-memory subscription management for development.
 * In production, this would be replaced with actual database operations.
 */

import { getAppMetadata, getMarketplaceId } from '@/lib/utils/app-mapping';

export interface MockSubscription {
  id: string;
  userId: string;
  appId: string; // This is the database CUID
  marketplaceId: string; // This is the marketplace ID (1, 2, 3, etc.)
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startedAt: string;
  cancelledAt?: string;
  app: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    category: string;
    pricing: string;
    price?: number;
    developer: {
      displayName: string;
      verified: boolean;
    };
  };
}

// In-memory storage for development
const subscriptions = new Map<string, MockSubscription>();
let subscriptionCounter = 1;

// Initialize with some sample data for development
function initializeSampleData() {
  if (subscriptions.size === 0) {
    // Add some sample subscriptions for demo user
    const demoUserId = 'demo-user-123';
    
    // Create sample subscriptions
    const sampleSubscriptions = [
      {
        marketplaceId: '1',
        appId: 'cm5legal001',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        marketplaceId: '3',
        appId: 'cm5dev001',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        marketplaceId: '6',
        appId: 'cm5marketing001',
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      }
    ];

    sampleSubscriptions.forEach(({ marketplaceId, appId, startedAt }) => {
      try {
        const metadata = getAppMetadata(marketplaceId);
        const appData = mockAppData[marketplaceId];
        
        if (metadata && appData) {
          const subscriptionId = `sub_${subscriptionCounter++}`;
          const subscription: MockSubscription = {
            id: subscriptionId,
            userId: demoUserId,
            appId,
            marketplaceId,
            status: 'ACTIVE',
            startedAt,
            app: {
              id: appId,
              name: appData.name,
              slug: metadata.slug,
              iconUrl: undefined,
              category: metadata.category,
              pricing: appData.pricing,
              price: appData.price,
              developer: appData.developer,
            },
          };
          
          subscriptions.set(subscriptionId, subscription);
        }
      } catch (error) {
        console.error('Error creating sample subscription:', error);
      }
    });
  }
}

// Initialize sample data when module loads
initializeSampleData();

// Mock app data based on marketplace
const mockAppData: Record<string, any> = {
  '1': {
    name: 'Legal Contract Analyzer',
    pricing: '$299/mo',
    price: 299,
    developer: { displayName: 'LegalAI Solutions', verified: true }
  },
  '2': {
    name: 'HIPAA Medical Scribe',
    pricing: '$149/mo',
    price: 149,
    developer: { displayName: 'HealthTech AI', verified: true }
  },
  '3': {
    name: 'Code Review Bot',
    pricing: '$49/mo',
    price: 49,
    developer: { displayName: 'DevSecure', verified: true }
  },
  '4': {
    name: 'Financial Report Analyzer',
    pricing: '$199/mo',
    price: 199,
    developer: { displayName: 'FinanceAI Pro', verified: true }
  },
  '5': {
    name: 'Research Paper Synthesizer',
    pricing: '$79/mo',
    price: 79,
    developer: { displayName: 'AcademicAI', verified: true }
  },
  '6': {
    name: 'Content Marketing Suite',
    pricing: '$99/mo',
    price: 99,
    developer: { displayName: 'ContentScale AI', verified: true }
  },
  '7': {
    name: 'Data Visualization Engine',
    pricing: '$149/mo',
    price: 149,
    developer: { displayName: 'DataViz Pro', verified: true }
  },
  '8': {
    name: 'Brand Voice Designer',
    pricing: '$89/mo',
    price: 89,
    developer: { displayName: 'BrandAI Studio', verified: false }
  },
  '9': {
    name: 'PDF Notes Generator',
    pricing: 'Free + API costs',
    price: 0,
    developer: { displayName: 'AI Marketplace', verified: true }
  }
};

export class MockSubscriptionService {
  /**
   * Get user subscriptions with optional status filter
   */
  static getUserSubscriptions(
    userId: string,
    status?: string,
    page = 1,
    limit = 10
  ): {
    subscriptions: MockSubscription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } {
    const userSubscriptions = Array.from(subscriptions.values())
      .filter(sub => sub.userId === userId)
      .filter(sub => !status || sub.status === status)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const total = userSubscriptions.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSubscriptions = userSubscriptions.slice(offset, offset + limit);

    return {
      subscriptions: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Create a new subscription
   */
  static createSubscription(
    userId: string,
    marketplaceId: string,
    appId: string
  ): MockSubscription {
    const metadata = getAppMetadata(marketplaceId);
    const appData = mockAppData[marketplaceId];

    if (!metadata || !appData) {
      throw new Error('Invalid app ID');
    }

    const subscriptionId = `sub_${subscriptionCounter++}`;
    const subscription: MockSubscription = {
      id: subscriptionId,
      userId,
      appId,
      marketplaceId,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      app: {
        id: appId,
        name: appData.name,
        slug: metadata.slug,
        iconUrl: undefined,
        category: metadata.category,
        pricing: appData.pricing,
        price: appData.price,
        developer: appData.developer,
      },
    };

    subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  /**
   * Check if user has an active subscription for an app
   */
  static hasActiveSubscription(userId: string, marketplaceId: string): boolean {
    return Array.from(subscriptions.values()).some(
      sub => sub.userId === userId && 
             sub.marketplaceId === marketplaceId && 
             sub.status === 'ACTIVE'
    );
  }

  /**
   * Update subscription status
   */
  static updateSubscription(
    subscriptionId: string,
    updates: Partial<Pick<MockSubscription, 'status' | 'cancelledAt'>>
  ): MockSubscription | null {
    const subscription = subscriptions.get(subscriptionId);
    if (!subscription) {
      return null;
    }

    const updatedSubscription = {
      ...subscription,
      ...updates,
    };

    if (updates.status === 'CANCELLED' && !updates.cancelledAt) {
      updatedSubscription.cancelledAt = new Date().toISOString();
    }

    subscriptions.set(subscriptionId, updatedSubscription);
    return updatedSubscription;
  }

  /**
   * Get subscription by ID
   */
  static getSubscription(subscriptionId: string): MockSubscription | null {
    return subscriptions.get(subscriptionId) || null;
  }

  /**
   * Delete subscription (for cleanup)
   */
  static deleteSubscription(subscriptionId: string): boolean {
    return subscriptions.delete(subscriptionId);
  }

  /**
   * Clear all subscriptions (for testing)
   */
  static clearAll(): void {
    subscriptions.clear();
    subscriptionCounter = 1;
  }

  /**
   * Get subscription stats for dashboard
   */
  static getSubscriptionStats(userId: string): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    recentInstalls: number;
  } {
    const userSubscriptions = Array.from(subscriptions.values())
      .filter(sub => sub.userId === userId);

    const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'ACTIVE');

    // Calculate recent installs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInstalls = userSubscriptions.filter(
      sub => new Date(sub.startedAt) > thirtyDaysAgo
    );

    return {
      totalSubscriptions: userSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      recentInstalls: recentInstalls.length,
    };
  }
}