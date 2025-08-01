/**
 * Individual Developer App API Endpoint
 * 
 * Handles individual app operations - GET, PUT, DELETE for specific apps
 * Uses Prisma with PostgreSQL for data persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    appId: string;
  };
}

// App update validation schema
const AppUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  shortDescription: z.string().min(1).max(200).optional(),
  description: z.string().min(100).max(5000).optional(),
  category: z.enum([
    'PRODUCTIVITY',
    'CONTENT_CREATION',
    'DATA_ANALYSIS',
    'EDUCATION',
    'BUSINESS',
    'DEVELOPER_TOOLS',
    'CODE_GENERATION',
    'LEGAL_TOOLS',
    'MEDICAL_TOOLS',
    'RESEARCH_TOOLS',
    'MARKETING_TOOLS',
    'DESIGN_TOOLS',
    'OTHER'
  ]).optional(),
  tags: z.array(z.string()).min(1).max(10).optional(),
  pricing: z.enum(['FREE', 'FREEMIUM', 'PAID', 'PAY_PER_USE', 'BYOK_ONLY']).optional(),
  price: z.number().optional(),
  requiredProviders: z.array(z.string()).min(1).optional(),
  supportedLocalModels: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional(),
  screenshotUrls: z.array(z.string().url()).min(1).max(5).optional(),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  runtimeType: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { appId } = params;
    
    // Find app in database
    const app = await prisma.marketplaceApp.findUnique({
      where: { id: appId },
      include: {
        developer: {
          select: {
            displayName: true,
            verified: true
          }
        },
        runtime: {
          select: {
            type: true,
            version: true
          }
        }
      }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Transform to match expected frontend format
    const transformedApp = {
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
      runtimeType: app.runtime.type,
      status: app.status,
      submittedAt: app.createdAt.toISOString(),
      submittedBy: app.developer.displayName,
      reviewNotes: null, // Will add when we implement review system
      approvedAt: app.publishedAt?.toISOString() || null,
      publishedAt: app.publishedAt?.toISOString() || null,
      version: app.version,
      downloads: app.downloadCount,
      rating: app.averageRating,
      reviewCount: app.reviewCount
    };

    return NextResponse.json({ app: transformedApp });
    
  } catch (error) {
    console.error('Error fetching app:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { appId } = params;
    const body = await request.json();
    
    // Validate the update data
    const validationResult = AppUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid update data',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Find app in mock database
    const appIndex = mockAppDatabase.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Update app
    const updatedApp = {
      ...mockAppDatabase[appIndex],
      ...validationResult.data,
      updatedAt: new Date().toISOString()
    };
    
    mockAppDatabase[appIndex] = updatedApp;

    console.log('App updated:', {
      id: updatedApp.id,
      name: updatedApp.name,
      status: updatedApp.status
    });

    return NextResponse.json({
      message: 'App updated successfully',
      app: updatedApp
    });
    
  } catch (error) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { appId } = params;
    
    // Find app in mock database
    const appIndex = mockAppDatabase.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    const deletedApp = mockAppDatabase[appIndex];
    mockAppDatabase.splice(appIndex, 1);

    console.log('App deleted:', {
      id: deletedApp.id,
      name: deletedApp.name
    });

    return NextResponse.json({
      message: 'App deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: 'Failed to delete app' },
      { status: 500 }
    );
  }
}