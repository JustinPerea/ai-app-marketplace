'use client';

import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  MessageSquare,
  Github,
  Twitter,
  Globe,
  Mail,
  Zap,
  BookOpen,
  Coffee,
  Trophy,
  Heart,
  Star
} from 'lucide-react';

export default function CommunityPage() {
  const communityStats = [
    {
      icon: Users,
      value: '12,500+',
      label: 'Active Developers',
      color: 'text-blue-400'
    },
    {
      icon: MessageSquare,
      value: '8,200+',
      label: 'Community Messages',
      color: 'text-green-400'
    },
    {
      icon: Github,
      value: '2,100+',
      label: 'Open Source Contributions',
      color: 'text-purple-400'
    },
    {
      icon: Trophy,
      value: '450+',
      label: 'Community Apps Built',
      color: 'text-yellow-400'
    }
  ];

  const communityChannels = [
    {
      name: 'General Discussion',
      description: 'Chat about AI, development, and marketplace updates',
      members: '3,200+',
      category: 'Popular',
      color: 'bg-blue-500'
    },
    {
      name: 'SDK Development',
      description: 'Technical discussions about our SDK and APIs',
      members: '1,800+',
      category: 'Technical',
      color: 'bg-purple-500'
    },
    {
      name: 'App Showcase',
      description: 'Share your apps and get feedback from the community',
      members: '2,900+',
      category: 'Creative',
      color: 'bg-green-500'
    },
    {
      name: 'Help & Support',
      description: 'Get help from our team and experienced developers',
      members: '4,100+',
      category: 'Support',
      color: 'bg-orange-500'
    }
  ];

  const contributorSpotlight = [
    {
      name: 'Sarah Chen',
      role: 'Senior Developer',
      contribution: 'Built the AI video processing framework',
      avatar: '/api/placeholder/64/64',
      apps: 12,
      contributions: 47
    },
    {
      name: 'Marcus Johnson',
      role: 'Community Moderator',
      contribution: 'Helps 100+ developers weekly with technical questions',
      avatar: '/api/placeholder/64/64',
      apps: 8,
      contributions: 156
    },
    {
      name: 'Alex Rodriguez',
      role: 'Open Source Contributor',
      contribution: 'Contributed to 15 community SDK improvements',
      avatar: '/api/placeholder/64/64',
      apps: 23,
      contributions: 89
    }
  ];

  return (
    <CosmicPageLayout gradientOverlay="blue">
      <div className="container mx-auto px-4 py-16">
        <CosmicPageHeader 
          icon={Users}
          title="Developer Community"
          subtitle="Join thousands of developers building the future of AI applications. Connect, learn, and grow together in our vibrant community."
          accentIcon={Heart}
        />

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <CosmicCard key={index} variant="glass" className="text-center">
                <CardContent className="p-6">
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </CardContent>
              </CosmicCard>
            );
          })}
        </div>

        {/* Community Channels */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Community Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityChannels.map((channel, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-sm border-gray-700 hover:bg-black/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{channel.name}</CardTitle>
                    <Badge variant="secondary" className={channel.color}>
                      {channel.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {channel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4" />
                      <span>{channel.members} members</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Join Channel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contributor Spotlight */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Contributor Spotlight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contributorSpotlight.map((contributor, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-white">{contributor.name}</CardTitle>
                      <CardDescription className="text-blue-400">
                        {contributor.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{contributor.contribution}</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{contributor.apps}</div>
                      <div className="text-gray-400 text-sm">Apps Built</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{contributor.contributions}</div>
                      <div className="text-gray-400 text-sm">Contributions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Events & Activities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coffee className="h-6 w-6 text-orange-400" />
                    Weekly Dev Coffee Chat
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-600">
                    Weekly
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  Every Friday at 2 PM EST
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Join our casual weekly chat where developers discuss projects, share tips, and network. 
                  Open to all community members!
                </p>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>Average 50-80 attendees</span>
                </div>
                <Button variant="outline" className="w-full">
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    AI App Challenge 2025
                  </CardTitle>
                  <Badge variant="secondary" className="bg-yellow-600">
                    Contest
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  February 15-28, 2025
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Build innovative AI applications using our platform. Prizes include $10K grand prize, 
                  $5K runner-up, and featured placement in our marketplace.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-400">$15K</div>
                    <div className="text-gray-400 text-sm">Total Prizes</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-400">200+</div>
                    <div className="text-gray-400 text-sm">Registered</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Join Community */}
        <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-blue-400" />
              Join Our Community
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Connect with fellow developers and start building amazing AI applications together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="glass-button-primary">
                <a href="https://discord.gg/cosmara-ai" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discord
                </a>
              </Button>
              <Button className="glass-button-secondary">
                <a href="https://github.com/cosmara-ai/community" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button className="glass-button-secondary">
                <a href="mailto:community@cosmara.ai">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </a>
              </Button>
              <Button className="glass-button-secondary">
                <Zap className="h-4 w-4 mr-2" />
                Newsletter
              </Button>
              <Button className="glass-button-secondary">
                <Users className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CosmicPageLayout>
  );
}