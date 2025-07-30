/**
 * Individual Subscription API Endpoint
 * 
 * Handles operations on specific subscriptions (delete for uninstall).
 */

import { NextRequest, NextResponse } from 'next/server';
import { MockSubscriptionService } from '@/lib/services/mock-subscription-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const { subscriptionId } = params;

    // Get the subscription first to verify it exists
    const subscription = MockSubscriptionService.getSubscription(subscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription status to CANCELLED
    const updatedSubscription = MockSubscriptionService.updateSubscription(
      subscriptionId,
      { 
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      }
    );

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'App uninstalled successfully',
      subscription: updatedSubscription
    });
    
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to uninstall app' },
      { status: 500 }
    );
  }
}