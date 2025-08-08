import { NextResponse } from 'next/server';

// Use the SDK's published entry point (aliased via next.config.js)
export async function GET() {
  try {
    const { checkProviderHealth } = await import('@byok-marketplace/sdk');
    const results = await checkProviderHealth();
    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: 'Provider health check unavailable',
      details: String(error?.message || error)
    }, { status: 200 });
  }
}



