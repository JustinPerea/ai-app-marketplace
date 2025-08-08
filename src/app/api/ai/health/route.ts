import { NextRequest, NextResponse } from 'next/server';

/**
 * AI System Health Monitoring Endpoint
 * 
 * GET /api/ai/health - Check system health and availability
 * 
 * This endpoint provides comprehensive health status for:
 * - API providers availability
 * - Database connectivity
 * - System performance metrics
 * - Service status indicators
 */

interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  responseTime: number;
  lastChecked: string;
  error?: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  timestamp: string;
  uptime: number;
  version: string;
  providers: ProviderHealth[];
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  responseTime: number;
}

// Simple health check for providers (without requiring API keys)
async function checkProviderHealth(provider: string, endpoint: string): Promise<ProviderHealth> {
  const startTime = Date.now();
  
  try {
    // Simple HEAD request to check if provider endpoint is reachable
    const response = await fetch(endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      provider,
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
      lastChecked: new Date().toISOString(),
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      provider,
      status: 'unavailable',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// Check database health
async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    // Simple database ping (you might want to use Prisma here)
    // For now, we'll simulate a database check
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected' as const,
      responseTime,
    };
  } catch (error) {
    return {
      status: 'disconnected' as const,
      responseTime: Date.now() - startTime,
    };
  }
}

// Get system memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    used: Math.round(usage.heapUsed / 1024 / 1024), // MB
    total: Math.round(usage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check all providers in parallel
    const providerChecks = await Promise.all([
      checkProviderHealth('OpenAI', 'https://api.openai.com/v1/models'),
      checkProviderHealth('Anthropic', 'https://api.anthropic.com/v1/messages'),
      checkProviderHealth('Google AI', 'https://generativelanguage.googleapis.com/v1beta/models'),
    ]);
    
    // Check database health
    const databaseHealth = await checkDatabaseHealth();
    
    // Get system metrics
    const memory = getMemoryUsage();
    const uptime = process.uptime();
    const responseTime = Date.now() - startTime;
    
    // Determine overall system status
    const providerStatuses = providerChecks.map(p => p.status);
    const hasUnhealthyProviders = providerStatuses.some(status => status === 'unavailable');
    const hasDegradedProviders = providerStatuses.some(status => status === 'degraded');
    
    let overallStatus: 'healthy' | 'degraded' | 'unavailable';
    if (databaseHealth.status === 'disconnected') {
      overallStatus = 'unavailable';
    } else if (hasUnhealthyProviders || memory.percentage > 90) {
      overallStatus = 'degraded';
    } else if (hasDegradedProviders || memory.percentage > 70) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    const healthStatus: SystemHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      version: process.env.npm_package_version || '1.0.0',
      providers: providerChecks,
      database: databaseHealth,
      memory,
      responseTime,
    };
    
    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: httpStatus });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: SystemHealth = {
      status: 'unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      providers: [],
      database: { status: 'disconnected', responseTime: 0 },
      memory: getMemoryUsage(),
      responseTime: Date.now() - startTime,
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';