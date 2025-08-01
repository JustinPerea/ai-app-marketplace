/**
 * Admin App Review API Endpoint
 * 
 * Handles admin operations for reviewing and managing app submissions
 * Used by COSMARA team to approve, reject, and publish apps
 * Uses Prisma with PostgreSQL for data persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Admin review action schema
const AdminReviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'PUBLISH', 'UNPUBLISH', 'REQUEST_CHANGES']),
  reviewNotes: z.string().optional(),
  publishedVersion: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query filters
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status as any;
    }
    
    if (category) {
      whereClause.category = category as any;
    }

    // Build sort order
    const orderBy: any = {};
    if (sortBy === 'submittedAt') {
      orderBy.createdAt = sortOrder as any;
    } else {
      orderBy[sortBy] = sortOrder as any;
    }

    // Get all apps for admin view
    const apps = await prisma.marketplaceApp.findMany({
      where: whereClause,
      include: {
        developer: {
          select: {
            displayName: true,
            verified: true,
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      },
      orderBy
    });

    // Get statistics for admin dashboard
    const allApps = await prisma.marketplaceApp.findMany({
      select: { status: true }
    });

    const stats = {
      total: allApps.length,
      pending: allApps.filter(app => app.status === 'PENDING_REVIEW').length,
      approved: allApps.filter(app => app.status === 'APPROVED').length,
      published: allApps.filter(app => app.status === 'PUBLISHED').length,
      rejected: allApps.filter(app => app.status === 'REJECTED').length,
      needsChanges: allApps.filter(app => app.status === 'NEEDS_CHANGES').length
    };

    // Transform apps to match expected format
    const transformedApps = apps.map(app => ({
      id: app.id,
      name: app.name,
      shortDescription: app.shortDescription,
      description: app.description,
      category: app.category,
      tags: app.tags,
      pricing: app.pricing,
      price: app.price,
      requiredProviders: app.requiredProviders,
      supportedLocalModels: app.supportedLocalModels,
      iconUrl: app.iconUrl,
      screenshotUrls: app.screenshotUrls,
      demoUrl: app.demoUrl,
      githubUrl: app.githubUrl,
      status: app.status,
      submittedAt: app.createdAt.toISOString(),
      submittedBy: app.developer.displayName,
      developerEmail: app.developer.user.email,
      reviewNotes: null, // Will add when we implement review system
      approvedAt: app.publishedAt?.toISOString() || null,
      publishedAt: app.publishedAt?.toISOString() || null,
      version: app.version,
      downloads: app.downloadCount,
      rating: app.averageRating,
      reviewCount: app.reviewCount
    }));

    return NextResponse.json({
      apps: transformedApps,
      stats,
      total: transformedApps.length
    });
    
  } catch (error) {
    console.error('Error fetching apps for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, ...reviewData } = body;
    
    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Validate review data
    const validationResult = AdminReviewSchema.safeParse(reviewData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid review data',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { action, reviewNotes, publishedVersion } = validationResult.data;

    // Find app in database
    const app = await prisma.marketplaceApp.findUnique({
      where: { id: appId }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    
    // Update app based on admin action
    let updateData: any = {};
    
    switch (action) {
      case 'APPROVE':
        updateData = {
          status: 'APPROVED',
          publishedAt: now // Mark as approved/published timestamp
        };
        break;
        
      case 'REJECT':
        updateData = {
          status: 'REJECTED'
        };
        break;
        
      case 'PUBLISH':
        if (app.status !== 'APPROVED' && app.status !== 'PENDING_REVIEW') {
          return NextResponse.json(
            { error: 'App must be approved before publishing' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'PUBLISHED',
          publishedAt: now,
          isActive: true,
          version: publishedVersion || app.version
        };
        break;
        
      case 'UNPUBLISH':
        updateData = {
          status: 'APPROVED',
          isActive: false
        };
        break;
        
      case 'REQUEST_CHANGES':
        updateData = {
          status: 'NEEDS_CHANGES'
        };
        break;
    }
    
    // Update the app in database
    const updatedApp = await prisma.marketplaceApp.update({
      where: { id: appId },
      data: updateData,
      include: {
        developer: {
          select: {
            displayName: true,
            verified: true
          }
        }
      }
    });

    console.log('Admin action performed:', {
      appId: updatedApp.id,
      appName: updatedApp.name,
      action,
      newStatus: updatedApp.status,
      adminUser: 'admin-user'
    });

    return NextResponse.json({
      message: `App ${action.toLowerCase()} successfully`,
      app: updatedApp
    });
    
  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json(
      { error: 'Failed to perform admin action' },
      { status: 500 }
    );
  }
}