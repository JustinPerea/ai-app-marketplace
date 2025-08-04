'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  Search, 
  Sparkles, 
  ArrowLeft,
  Zap,
  Bot
} from 'lucide-react';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background stars */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-1/5 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <Bot className="h-16 w-16 text-purple-400" />
                  <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <h2 className="text-3xl font-bold text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-gray-300 text-lg">
                Looks like this page drifted into the cosmic void. 
                Let's get you back to exploring AI possibilities!
              </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Home className="h-8 w-8 text-blue-400" />
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Go Home</h3>
                      <p className="text-gray-400 text-sm">Return to the main platform</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Search className="h-8 w-8 text-green-400" />
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Explore Apps</h3>
                      <p className="text-gray-400 text-sm">Browse our AI marketplace</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/marketplace">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Popular Destinations */}
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Popular Destinations
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Quick links to get you back on track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
                    <Link href="/setup">
                      API Setup
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
                    <Link href="/developers">
                      Developers
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
                    <Link href="/ai-guide">
                      AI Guide
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="mt-8">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}