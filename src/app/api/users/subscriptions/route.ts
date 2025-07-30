/**
 * User Subscriptions API Endpoint
 * 
 * Provides mock subscription data for development.
 * In production, this would connect to a real database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MockSubscriptionService } from '@/lib/services/mock-subscription-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // For development, we'll use a mock user ID
    const userId = 'demo-user-123';
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get subscriptions from mock service
    const result = MockSubscriptionService.getUserSubscriptions(
      userId,
      status,
      page,
      limit
    );

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // For development, we'll use a mock user ID
    const userId = 'demo-user-123';

    // Create subscription using mock service
    const subscription = MockSubscriptionService.createSubscription(
      userId,
      appId, // marketplace ID
      `app_${appId}` // database CUID
    );

    return NextResponse.json({
      message: 'App installed successfully!',
      subscription
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to install app' },
      { status: 500 }
    );
  }
}