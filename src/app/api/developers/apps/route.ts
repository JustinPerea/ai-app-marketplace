/**
 * Developer App Submissions API Endpoint
 * 
 * Handles submission of new apps from developers for COSMARA review.
 * Uses Prisma with PostgreSQL for data persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// App submission validation schema
const AppSubmissionSchema = z.object({
  // Basic Information
  name: z.string().min(1).max(100),
  shortDescription: z.string().min(1).max(200),
  description: z.string().min(100).max(5000),
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
  ]),
  tags: z.array(z.string()).min(1).max(10),
  
  // Pricing
  pricing: z.enum(['FREE', 'FREEMIUM', 'PAID', 'PAY_PER_USE', 'BYOK_ONLY']),
  price: z.number().optional(),
  
  // Technical
  requiredProviders: z.array(z.string()).min(1),
  supportedLocalModels: z.array(z.string()).optional(),
  
  // Assets
  iconUrl: z.string().url(),
  screenshotUrls: z.array(z.string().url()).min(1).max(5),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  
  // Runtime (placeholder for future)
  runtimeType: z.string().default('JAVASCRIPT')
});

// Create slug from app name for URL-friendly identifier
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the submission
    const validationResult = AppSubmissionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid submission data',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const appData = validationResult.data;

    // For now, we'll create a demo developer profile if it doesn't exist
    // In production, this would come from authentication
    const demoUserId = 'demo-user-id';
    
    // Ensure demo user exists
    await prisma.user.upsert({
      where: { id: demoUserId },
      update: {},
      create: {
        id: demoUserId,
        email: 'demo@developer.com',
        name: 'Demo Developer',
        plan: 'FREE'
      }
    });

    // Ensure developer profile exists
    const developerProfile = await prisma.developerProfile.upsert({
      where: { userId: demoUserId },
      update: {},
      create: {
        userId: demoUserId,
        displayName: 'Demo Developer',
        description: 'Demo developer account for testing submissions'
      }
    });

    // Create runtime configuration (basic JavaScript runtime)
    const runtime = await prisma.appRuntime.create({
      data: {
        type: 'JAVASCRIPT',
        version: '18.0.0',
        sourceCode: '// App source code will be provided during GitHub integration',
        entryPoint: 'index.js',
        allowNetworking: true,
        timeoutSeconds: 30
      }
    });

    // Map form data to Prisma schema
    const slug = createSlug(appData.name);
    const uniqueSlug = `${slug}-${Date.now()}`;

    // Convert pricing enum to match Prisma schema
    const pricingMap: Record<string, any> = {
      'FREE': 'FREE',
      'FREEMIUM': 'FREEMIUM', 
      'PAID': 'PAID',
      'PAY_PER_USE': 'PAY_PER_USE',
      'BYOK_ONLY': 'BYOK_ONLY'
    };

    // Convert provider strings to enum values
    const providerMap: Record<string, any> = {
      'openai': 'OPENAI',
      'anthropic': 'ANTHROPIC',
      'google': 'GOOGLE',
      'cohere': 'COHERE',
      'huggingface': 'HUGGING_FACE',
      'ollama': 'OLLAMA'
    };

    const mappedProviders = appData.requiredProviders.map(p => providerMap[p.toLowerCase()] || 'OPENAI');

    // Create the app submission in database
    const appSubmission = await prisma.marketplaceApp.create({
      data: {
        name: appData.name,
        slug: uniqueSlug,
        description: appData.description,
        shortDescription: appData.shortDescription,
        category: appData.category as any,
        tags: appData.tags,
        version: '1.0.0',
        developerId: developerProfile.id,
        pricing: pricingMap[appData.pricing] || 'FREE',
        price: appData.price || null,
        isActive: false,
        iconUrl: appData.iconUrl,
        screenshotUrls: appData.screenshotUrls,
        demoUrl: appData.demoUrl || null,
        githubUrl: appData.githubUrl || null,
        runtimeId: runtime.id,
        requiredProviders: mappedProviders,
        supportedLocalModels: [],
        status: 'PENDING_REVIEW',
        downloadCount: 0,
        activeUsers: 0,
        reviewCount: 0,
        executionCount: 0
      }
    });

    console.log('New app submission created in database:', {
      id: appSubmission.id,
      name: appSubmission.name,
      category: appSubmission.category,
      status: appSubmission.status
    });

    return NextResponse.json({
      message: 'App submitted successfully for review',
      app: {
        id: appSubmission.id,
        name: appSubmission.name,
        status: appSubmission.status,
        submittedAt: appSubmission.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing app submission:', error);
    return NextResponse.json(
      { error: 'Failed to process app submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const developerId = searchParams.get('developer');
    
    // Build query filters
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status as any;
    }
    
    if (category) {
      whereClause.category = category as any;
    }
    
    if (developerId) {
      whereClause.developerId = developerId;
    } else {
      // For demo purposes, filter by demo developer
      const demoUser = await prisma.user.findUnique({
        where: { id: 'demo-user-id' },
        include: { developerProfile: true }
      });
      
      if (demoUser?.developerProfile) {
        whereClause.developerId = demoUser.developerProfile.id;
      }
    }

    // Fetch apps from database
    const apps = await prisma.marketplaceApp.findMany({
      where: whereClause,
      include: {
        developer: {
          select: {
            displayName: true,
            verified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get summary statistics for the developer dashboard
    const allApps = await prisma.marketplaceApp.findMany({
      where: developerId ? { developerId } : (whereClause.developerId ? { developerId: whereClause.developerId } : {}),
      select: { status: true }
    });

    const summary = {
      pending: allApps.filter(app => app.status === 'PENDING_REVIEW').length,
      approved: allApps.filter(app => app.status === 'APPROVED').length,
      published: allApps.filter(app => app.status === 'PUBLISHED').length,
      rejected: allApps.filter(app => app.status === 'REJECTED').length
    };

    // Transform apps to match expected frontend format
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
      runtimeType: 'JAVASCRIPT', // For compatibility
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
    }));

    return NextResponse.json({
      apps: transformedApps,
      total: transformedApps.length,
      summary
    });
    
  } catch (error) {
    console.error('Error fetching app submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app submissions' },
      { status: 500 }
    );
  }
}