'use client';

import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Github,
  MessageCircle,
  BookOpen,
  Code2,
  Sparkles,
  ExternalLink,
  Heart,
  Star,
  Zap,
  Globe,
  Mail,
  Calendar
} from 'lucide-react';

export default function CommunityPage() {
  return (
    <CosmicPageLayout gradientOverlay="purple">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <CosmicPageHeader 
          icon={Users}
          title="Developer Community"
          subtitle="Join thousands of developers building the future of AI applications. Connect, collaborate, and create amazing AI experiences together."
          accentIcon={Sparkles}
        />

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">2.5K+</div>
                <div className="text-gray-300">Active Developers</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">150+</div>
                <div className="text-gray-300">Published Apps</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">500K+</div>
                <div className="text-gray-300">API Calls Daily</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">95%</div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Community Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Github className="h-6 w-6 text-white" />
                  GitHub Community
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Contribute to our open-source SDK and explore example applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">⭐ Stars</span>
                  <Badge variant="secondary">1.2K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">🍴 Forks</span>
                  <Badge variant="secondary">180</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">🐛 Issues</span>
                  <Badge variant="secondary">12 open</Badge>
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700" asChild>
                  <a href="https://github.com/cosmara-ai" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Visit GitHub
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-blue-400" />
                  Discord Server
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time chat, support, and collaboration with fellow developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">👥 Members</span>
                  <Badge variant="secondary">2.5K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">💬 Messages</span>
                  <Badge variant="secondary">50K+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">🟢 Online</span>
                  <Badge variant="secondary" className="bg-green-600">680</Badge>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join Discord
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Community Programs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Community Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <Star className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-white">Ambassador Program</CardTitle>
                  <CardDescription className="text-gray-400">
                    Become a <span className="text-cosmara-brand">COSMARA</span> ambassador and get exclusive perks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Early access to new features</li>
                    <li>• Exclusive ambassador badge</li>
                    <li>• Direct line to our team</li>
                    <li>• Speaking opportunities</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <Code2 className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle className="text-white">Open Source</CardTitle>
                  <CardDescription className="text-gray-400">
                    Contribute to our codebase and shape the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• SDK contributions welcome</li>
                    <li>• Bug bounty program</li>
                    <li>• Feature development</li>
                    <li>• Documentation improvements</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4 border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                    Start Contributing
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white">Developer Blog</CardTitle>
                  <CardDescription className="text-gray-400">
                    Share your knowledge with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Guest post opportunities</li>
                    <li>• Technical tutorials</li>
                    <li>• Case studies</li>
                    <li>• Best practices sharing</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black">
                    Submit Article
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Events & Meetups */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Events & Meetups</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-blue-400" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <div className="font-semibold text-white">AI Video Generation Workshop</div>
                    <div className="text-gray-400 text-sm">August 15, 2025 • 2:00 PM PST</div>
                    <div className="text-gray-300 text-sm">Learn to integrate Gemini Veo in your apps</div>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <div className="font-semibold text-white">Community Showcase</div>
                    <div className="text-gray-400 text-sm">August 22, 2025 • 6:00 PM PST</div>
                    <div className="text-gray-300 text-sm">Show off your latest AI applications</div>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <div className="font-semibold text-white">Developer Office Hours</div>
                    <div className="text-gray-400 text-sm">Every Friday • 3:00 PM PST</div>
                    <div className="text-gray-300 text-sm">Get help from our engineering team</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-6 w-6 text-green-400" />
                    Global Meetups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">San Francisco</div>
                      <div className="text-gray-400 text-sm">Monthly • Last Thursday</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">New York</div>
                      <div className="text-gray-400 text-sm">Monthly • Second Tuesday</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">London</div>
                      <div className="text-gray-400 text-sm">Monthly • First Wednesday</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Tokyo</div>
                      <div className="text-gray-400 text-sm">Monthly • Third Friday</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Start a Meetup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Get Involved */}
          <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-red-400" />
                Get Involved
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Ready to be part of the <span className="text-cosmara-brand">COSMARA</span> developer community?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="mailto:community@cosmara.ai">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Us
                  </a>
                </Button>
                <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black">
                  <Zap className="h-4 w-4 mr-2" />
                  Newsletter
                </Button>
                <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                  <Users className="h-4 w-4 mr-2" />
                  Join Discord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CosmicPageLayout>
  );
}