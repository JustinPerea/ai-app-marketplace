/**
 * Individual Developer App API Endpoint
 * 
 * Handles individual app operations - GET, PUT, DELETE for specific apps
 * Uses Prisma with PostgreSQL for data persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireDeveloper, canModifyApp } from '@/lib/auth/developer-auth';

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
    
    // Authenticate user
    const { user, developerId, error } = await requireDeveloper(request);
    
    if (error || !developerId) {
      return NextResponse.json(
        { error: error || 'Developer authentication required' },
        { status: 401 }
      );
    }

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

    // Check if user can access this app
    if (app.developerId !== developerId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
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
    
    // Authenticate user
    const { user, developerId, error } = await requireDeveloper(request);
    
    if (error || !developerId) {
      return NextResponse.json(
        { error: error || 'Developer authentication required' },
        { status: 401 }
      );
    }

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

    // Find app in database
    const existingApp = await prisma.marketplaceApp.findUnique({
      where: { id: appId }
    });
    
    if (!existingApp) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user can modify this app
    if (existingApp.developerId !== developerId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow updates if app is not published
    if (existingApp.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Cannot update published app' },
        { status: 403 }
      );
    }

    const updateData = validationResult.data;
    
    // Prepare update object
    const updatedAppData: any = {
      updatedAt: new Date()
    };

    // Map validated fields to database schema
    if (updateData.name) updatedAppData.name = updateData.name;
    if (updateData.shortDescription) updatedAppData.shortDescription = updateData.shortDescription;
    if (updateData.description) updatedAppData.description = updateData.description;
    if (updateData.category) updatedAppData.category = updateData.category;
    if (updateData.tags) updatedAppData.tags = updateData.tags;
    if (updateData.pricing) updatedAppData.pricing = updateData.pricing;
    if (updateData.price !== undefined) updatedAppData.price = updateData.price;
    if (updateData.iconUrl) updatedAppData.iconUrl = updateData.iconUrl;
    if (updateData.screenshotUrls) updatedAppData.screenshotUrls = updateData.screenshotUrls;
    if (updateData.demoUrl !== undefined) updatedAppData.demoUrl = updateData.demoUrl;
    if (updateData.githubUrl !== undefined) updatedAppData.githubUrl = updateData.githubUrl;
    
    // Map required providers
    if (updateData.requiredProviders) {
      const providerMap: Record<string, any> = {
        'OPENAI': 'OPENAI',
        'ANTHROPIC': 'ANTHROPIC',
        'GOOGLE': 'GOOGLE',
        'AZURE_OPENAI': 'AZURE_OPENAI',
        'COHERE': 'COHERE',
        'HUGGING_FACE': 'HUGGING_FACE'
      };
      updatedAppData.requiredProviders = updateData.requiredProviders.map(p => 
        providerMap[p.toUpperCase()] || 'OPENAI'
      );
    }

    // Update app in database
    const updatedApp = await prisma.marketplaceApp.update({
      where: { id: appId },
      data: updatedAppData,
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

    console.log('App updated:', {
      id: updatedApp.id,
      name: updatedApp.name,
      status: updatedApp.status
    });

    // Transform to match expected frontend format
    const transformedApp = {
      id: updatedApp.id,
      name: updatedApp.name,
      shortDescription: updatedApp.shortDescription,
      description: updatedApp.description,
      category: updatedApp.category,
      tags: updatedApp.tags,
      pricing: updatedApp.pricing,
      price: updatedApp.price,
      requiredProviders: updatedApp.requiredProviders,
      supportedLocalModels: updatedApp.supportedLocalModels,
      iconUrl: updatedApp.iconUrl,
      screenshotUrls: updatedApp.screenshotUrls,
      demoUrl: updatedApp.demoUrl,
      githubUrl: updatedApp.githubUrl,
      runtimeType: updatedApp.runtime.type,
      status: updatedApp.status,
      submittedAt: updatedApp.createdAt.toISOString(),
      submittedBy: updatedApp.developer.displayName,
      reviewNotes: null,
      approvedAt: updatedApp.publishedAt?.toISOString() || null,
      publishedAt: updatedApp.publishedAt?.toISOString() || null,
      version: updatedApp.version,
      downloads: updatedApp.downloadCount,
      rating: updatedApp.averageRating,
      reviewCount: updatedApp.reviewCount
    };

    return NextResponse.json({
      message: 'App updated successfully',
      app: transformedApp
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
    
    // Authenticate user
    const { user, developerId, error } = await requireDeveloper(request);
    
    if (error || !developerId) {
      return NextResponse.json(
        { error: error || 'Developer authentication required' },
        { status: 401 }
      );
    }
    
    // Find app in database
    const existingApp = await prisma.marketplaceApp.findUnique({
      where: { id: appId },
      include: {
        developer: {
          select: {
            displayName: true
          }
        }
      }
    });
    
    if (!existingApp) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this app
    if (existingApp.developerId !== developerId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow deletion if app is not published
    if (existingApp.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Cannot delete published app' },
        { status: 403 }
      );
    }

    // Delete the app and related data
    await prisma.marketplaceApp.delete({
      where: { id: appId }
    });

    console.log('App deleted:', {
      id: existingApp.id,
      name: existingApp.name,
      developer: existingApp.developer.displayName
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