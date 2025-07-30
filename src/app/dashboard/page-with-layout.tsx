'use client';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Cosmic Background Wrapper */}
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #0B1426 0%, #1E2A4A 50%, #2D1B69 100%)'
      }}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E2E8F0]">Dashboard Overview</h1>
          <p className="text-[#94A3B8] mt-2">
            Monitor your AI applications, API usage, and spending in one place
          </p>
        </div>

        {/* Simple test card */}
        <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-[#E2E8F0]">Test Card</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Testing dashboard functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#E2E8F0]">If you can see this, the basic dashboard is working.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}