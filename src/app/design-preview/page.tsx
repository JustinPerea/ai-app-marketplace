/**
 * Design System Preview Page
 * 
 * IMPLEMENTATION REASONING:
 * Creates a comprehensive preview of our new "Sleek Glass + Dark" design system.
 * Shows sophisticated blue/pink palette, glassmorphism effects, and premium typography.
 * Alternative warm technical system replaced per user feedback: "not wow'd by it"
 * This showcases the sophisticated aesthetic that creates immediate "wow" factor.
 * If this breaks, check that glass effect CSS variables and backdrop-filter are supported.
 * 
 * DEPENDENCIES:
 * - Requires glass design system CSS variables and utilities
 * - Assumes React environment with proper component lifecycle
 * - Performance: Optimized glass effects for design validation
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Shield, 
  DollarSign, 
  Zap, 
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Moon,
  Sun,
  Palette
} from 'lucide-react';

export default function DesignPreviewPage() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [accentColor, setAccentColor] = useState('taupe'); // Default to Sophisticated Neutrals choice

  // Toggle dark/light mode
  const toggleMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // Color options for testing - Including research-based alternatives
  const colorOptions = [
    // Current Pink/Purple (for comparison)
    { name: 'magenta', label: 'Current Magenta', color: '#C026D3', description: 'Current - deep magenta', category: 'Current' },
    { name: 'rose', label: 'Current Rose', color: '#EC4899', description: 'Current - rose accent', category: 'Current' },
    
    // Research Option 1: Sophisticated Neutrals 
    { name: 'taupe', label: 'Warm Taupe', color: '#D4B5A0', description: 'Sophisticated warmth', category: 'Neutrals' },
    { name: 'dusty-rose', label: 'Dusty Rose', color: '#E6B3BA', description: 'Subtle pink alternative', category: 'Neutrals' },
    { name: 'soft-lavender', label: 'Soft Lavender', color: '#D1C7E0', description: 'Bridge color', category: 'Neutrals' },
    
    // Research Option 2: Warm Coral Complements
    { name: 'coral', label: 'Coral Pink', color: '#FF7F7F', description: 'Vibrant but professional', category: 'Coral' },
    { name: 'salmon', label: 'Salmon', color: '#FA8072', description: 'Softer coral variant', category: 'Coral' },
    { name: 'peach', label: 'Peach', color: '#FFCBA4', description: 'Warm bridge color', category: 'Coral' },
    
    // Blue references
    { name: 'azure', label: 'Azure Blue', color: '#3B82F6', description: 'Reference - azure', category: 'Blues' },
    { name: 'sapphire', label: 'Sapphire Blue', color: '#2563EB', description: 'Reference - sapphire', category: 'Blues' },
  ];

  return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Controls */}
        <div className="glass-card mb-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-innovation-magenta to-bridge-violet"></div>
            <span className="text-h3 text-glass-gradient">Sleek Glass Design System</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className="flex items-center space-x-2 glass-button-secondary px-4 py-2"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            {/* Color Options */}
            <div className="flex items-center space-x-4">
              <Palette className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Test Colors:</span>
              
              {/* Group colors by category */}
              {['Current', 'Neutrals', 'Coral', 'Blues'].map((category) => (
                <div key={category} className="flex items-center space-x-1">
                  <span className="text-xs text-text-muted mr-1">{category}:</span>
                  {colorOptions
                    .filter(option => option.category === category)
                    .map((option) => (
                      <button
                        key={option.name}
                        onClick={() => setAccentColor(option.name)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          accentColor === option.name ? 'border-text-primary scale-110' : 'border-border'
                        }`}
                        style={{ backgroundColor: option.color }}
                        title={`${option.label} - ${option.description}`}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-hero-glass mb-4">
            Neutral Glass Design System
          </h1>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Close-to-black/white primary colors with selective accent colors. 
            Enhanced dark/light glass system for maximum versatility and reduced blue dominance.
          </p>
        </div>

        {/* Dark/Light Glass Showcase */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Dark/Light Glass Variations</h2>
            <p className="text-body-glass">Compare standard light glass vs dark glass overlays</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-h3 mb-3 text-text-primary">Light Glass (Default)</h3>
              <p className="text-body-glass mb-4">
                Uses light glass overlay with subtle transparency. Perfect for standard glass cards.
              </p>
              <div className="w-full h-20 glass-card flex items-center justify-center">
                <span className="text-sm text-text-secondary">Light Glass Effect</span>
              </div>
            </div>
            
            <div className="glass-card-dark p-6">
              <h3 className="text-h3 mb-3 text-text-primary">Dark Glass Variant</h3>
              <p className="text-body-glass mb-4">
                Uses dark glass overlay for stronger contrast. Ideal for emphasis and depth.
              </p>
              <div className="w-full h-20 glass-card-dark flex items-center justify-center">
                <span className="text-sm text-text-secondary">Dark Glass Effect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Typography Hierarchy</h2>
            <p className="text-body-glass">Inter Variable for headlines, optimized for glass backgrounds</p>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-hero-glass">Hero Glass Effect</div>
              <p className="text-small text-text-muted">text-hero-glass • clamp(2.5rem, 6vw, 4.5rem) • Gradient text</p>
            </div>
            
            <div>
              <div className="text-hero">Standard Hero</div>
              <p className="text-small text-text-muted">text-hero • clamp(2.5rem, 6vw, 4.5rem) • Inter Display</p>
            </div>
            
            <div>
              <div className="text-h1">Primary Headline</div>
              <p className="text-small text-text-muted">text-h1 • clamp(2rem, 4vw, 3rem) • Inter Display</p>
            </div>
            
            <div>
              <div className="text-h2">Secondary Headline</div>
              <p className="text-small text-text-muted">text-h2 • clamp(1.75rem, 3vw, 2.25rem) • Inter Display</p>
            </div>
            
            <div>
              <div className="text-h3">Tertiary Headline</div>
              <p className="text-small text-text-muted">text-h3 • clamp(1.25rem, 2.5vw, 1.5rem) • Inter Display</p>
            </div>
            
            <div>
              <div className="text-body-lg">Large body text optimized for glass backgrounds</div>
              <p className="text-small text-text-muted">text-body-lg • 1.125rem • Inter Variable</p>
            </div>
            
            <div>
              <div className="text-body-glass">Glass-optimized body text with enhanced readability</div>
              <p className="text-small text-text-muted">text-body-glass • 1rem • With subtle text shadow</p>
            </div>
            
            <div>
              <div className="text-small">Small text for captions and secondary information</div>
              <p className="text-small text-text-muted">text-small • 0.875rem • Inter Variable</p>
            </div>
          </div>
        </div>

        {/* Research-Based Color Comparisons */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Color Research Comparison</h2>
            <p className="text-body-glass">Current vs. research-based color palettes from Coolors.co analysis</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Current Pink/Purple */}
            <div className="glass-card p-4">
              <h3 className="text-h3 mb-3 text-text-primary">Current Pink/Purple</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#C026D3' }}></div>
                  <span className="text-sm text-text-secondary">Innovation Magenta</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#EC4899' }}></div>
                  <span className="text-sm text-text-secondary">Innovation Rose</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#7C3AED' }}></div>
                  <span className="text-sm text-text-secondary">Bridge Violet</span>
                </div>
              </div>
            </div>

            {/* Sophisticated Neutrals */}
            <div className="glass-card p-4">
              <h3 className="text-h3 mb-3 text-text-primary">Sophisticated Neutrals</h3>
              <p className="text-xs text-text-muted mb-3">Research-based from Coolors.co</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#D4B5A0' }}></div>
                  <span className="text-sm text-text-secondary">Warm Taupe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#E6B3BA' }}></div>
                  <span className="text-sm text-text-secondary">Dusty Rose</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#D1C7E0' }}></div>
                  <span className="text-sm text-text-secondary">Soft Lavender</span>
                </div>
              </div>
            </div>

            {/* Warm Coral Complements */}
            <div className="glass-card p-4">
              <h3 className="text-h3 mb-3 text-text-primary">Warm Coral Complements</h3>
              <p className="text-xs text-text-muted mb-3">Color theory complements</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FF7F7F' }}></div>
                  <span className="text-sm text-text-secondary">Coral Pink</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FA8072' }}></div>
                  <span className="text-sm text-text-secondary">Salmon</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FFCBA4' }}></div>
                  <span className="text-sm text-text-secondary">Peach</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Current Color System</h2>
            <p className="text-body-glass">Deep space blues with selected accent colors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Deep Space Blues */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Deep Space Blues</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#0A1628' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Navy Foundation</p>
                    <p className="text-small text-text-muted">#0A1628</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#2563EB' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Sapphire Action</p>
                    <p className="text-small text-text-muted">#2563EB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Azure Highlight</p>
                    <p className="text-small text-text-muted">#3B82F6</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Accent Colors */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Selected Accent Colors</h4>
              <div className="space-y-3">
                {colorOptions
                  .filter(option => ['magenta', 'rose', 'taupe', 'dusty-rose', 'coral', 'salmon'].includes(option.name))
                  .slice(0, 3)
                  .map((option) => (
                    <div key={option.name} className="flex items-center space-x-3">
                      <div 
                        className={`w-12 h-12 rounded-lg border-2 transition-all cursor-pointer ${
                          accentColor === option.name ? 'border-text-primary scale-105' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: option.color }}
                        onClick={() => setAccentColor(option.name)}
                      ></div>
                      <div>
                        <p className="font-medium text-text-primary">{option.label}</p>
                        <p className="text-small text-text-muted">
                          {option.color} • {option.category}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-text-muted mt-3">
                Click color swatches above to test different accent colors throughout the interface
              </p>
            </div>

            {/* Glass Overlays */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Glass Effects</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg glass-base border border-white/20" 
                       style={{ background: 'var(--color-glass-white)' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Glass White</p>
                    <p className="text-small text-text-muted">10% opacity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg glass-base border border-blue-500/20" 
                       style={{ background: 'var(--color-glass-blue)' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Glass Blue</p>
                    <p className="text-small text-text-muted">15% opacity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg glass-base border border-pink-500/20" 
                       style={{ background: 'var(--color-glass-pink)' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Glass Pink</p>
                    <p className="text-small text-text-muted">12% opacity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Foundations */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Dark Foundation</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg border border-border" 
                       style={{ backgroundColor: '#0D1117' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Obsidian Base</p>
                    <p className="text-small text-text-muted">#0D1117</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg border border-border" 
                       style={{ backgroundColor: '#161B22' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Charcoal Surface</p>
                    <p className="text-small text-text-muted">#161B22</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg border border-border" 
                       style={{ backgroundColor: '#21262D' }}></div>
                  <div>
                    <p className="font-medium text-text-primary">Graphite Element</p>
                    <p className="text-small text-text-muted">#21262D</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Examples */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Glass Component System</h2>
            <p className="text-body-glass">Premium glassmorphism components with sophisticated interactions</p>
          </div>
          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Glass Button Styles</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="glass-button-primary px-6 py-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Browse AI Apps</span>
                </button>
                <button className="glass-button-secondary px-6 py-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>See How It Works</span>
                </button>
                <button 
                  className="btn-primary px-6 py-3 flex items-center space-x-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${colorOptions.find(c => c.name === accentColor)?.color || '#C026D3'}, var(--color-bridge-violet))`
                  }}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Calculate Savings</span>
                </button>
              </div>
              <p className="text-small text-text-muted mt-2">
                Third button adapts to selected accent color - compare the research options
              </p>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Glass Badges & Tags</h4>
              <div className="flex flex-wrap gap-3">
                <div 
                  className="glass-base px-3 py-1 rounded-full border flex items-center space-x-1" 
                  style={{ 
                    background: `${colorOptions.find(c => c.name === accentColor)?.color || '#C026D3'}20`,
                    borderColor: `${colorOptions.find(c => c.name === accentColor)?.color || '#C026D3'}40`
                  }}
                >
                  <TrendingUp className="w-3 h-3" style={{ color: colorOptions.find(c => c.name === accentColor)?.color || '#C026D3' }} />
                  <span className="text-sm font-medium text-text-primary">80% Savings</span>
                </div>
                <div className="glass-base px-3 py-1 rounded-full border border-purple-500/30 flex items-center space-x-1" 
                     style={{ background: 'var(--color-glass-purple)' }}>
                  <Sparkles className="w-3 h-3 text-bridge-violet" />
                  <span className="text-sm font-medium text-text-primary">AI Powered</span>
                </div>
                <div className="glass-base px-3 py-1 rounded-full border border-blue-500/30 flex items-center space-x-1" 
                     style={{ background: 'var(--color-glass-blue)' }}>
                  <CheckCircle className="w-3 h-3 text-accent-azure" />
                  <span className="text-sm font-medium text-text-primary">Verified</span>
                </div>
                <div className="glass-base px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1" 
                     style={{ background: 'var(--color-glass-white)' }}>
                  <Users className="w-3 h-3 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">Enterprise Ready</span>
                </div>
              </div>
              <p className="text-small text-text-muted mt-2">
                First badge adapts to selected accent color for comparison
              </p>
            </div>

            {/* Cards */}
            <div>
              <h4 className="text-h3 mb-4 text-text-primary">Glass Card Components</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ 
                      background: `linear-gradient(135deg, ${colorOptions.find(c => c.name === accentColor)?.color || '#C026D3'}, var(--color-bridge-violet))` 
                    }}
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-h3 mb-3 text-text-primary">Cost Savings</h3>
                  <p className="text-body-glass mb-4">
                    Save 80% compared to traditional AI subscriptions
                  </p>
                  <p className="text-body-glass">
                    Use your own API keys for direct provider pricing without markup.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button 
                      className="hover:text-accent-sky transition-colors font-medium text-sm"
                      style={{ color: colorOptions.find(c => c.name === accentColor)?.color || '#C026D3' }}
                    >
                      Learn More →
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                       style={{ background: 'linear-gradient(135deg, var(--color-bridge-violet), var(--color-bridge-purple))' }}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-h3 mb-3 text-text-primary">Your Data</h3>
                  <p className="text-body-glass mb-4">
                    Complete control over your API keys and data
                  </p>
                  <p className="text-body-glass">
                    Your keys never leave your browser. Direct communication with AI providers.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button className="text-bridge-violet hover:text-bridge-lavender transition-colors font-medium text-sm">
                      Learn More →
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                       style={{ background: 'linear-gradient(135deg, var(--color-accent-sapphire), var(--color-accent-azure))' }}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-h3 mb-3 text-text-primary">Your Choice</h3>
                  <p className="text-body-glass mb-4">
                    Switch between OpenAI, Claude, Gemini, and more
                  </p>
                  <p className="text-body-glass">
                    No vendor lock-in. Use the best AI model for each specific task.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button className="text-accent-azure hover:text-accent-sky transition-colors font-medium text-sm">
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-small text-text-muted mt-4">
                <strong>Dynamic Elements:</strong> The first card icon and "Learn More" link adapt to the selected accent color. 
                Compare how the research-based colors (Neutrals, Coral) work with our blue foundation.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section Preview */}
        <div className="glass-card mb-8 p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Glass Hero Section</h2>
            <p className="text-body-glass">How the sophisticated aesthetic creates immediate impact</p>
          </div>
          <div className="glass-card p-12 text-center relative overflow-hidden">
            {/* Background gradient enhancement */}
            <div className="absolute inset-0 bg-gradient-to-br from-innovation-magenta/5 via-accent-azure/3 to-bridge-violet/5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h1 className="text-hero-glass mb-6">
                Your AI, Your Keys,
                <br />
                <span className="text-glass-gradient">Your Future</span>
              </h1>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
                Experience premium AI orchestration with sophisticated glassmorphism design. 
                Enterprise-grade performance meets cutting-edge aesthetic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button className="glass-button-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Explore Glass UI</span>
                </button>
                <button className="glass-button-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>See Innovation</span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/10">
                <p className="text-small text-text-muted mb-4">Premium glass aesthetic for</p>
                <div className="flex justify-center items-center space-x-8 opacity-80">
                  <div className="text-body font-semibold text-text-secondary">Enterprise</div>
                  <div className="text-body font-semibold text-text-secondary">Innovation</div>
                  <div className="text-body font-semibold text-text-secondary">Sophistication</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-section-header">Glass Design System Summary</h2>
            <p className="text-body-glass">Sophisticated enterprise aesthetic with "wow" factor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-h3 mb-3 text-text-primary">Visual Principles</h4>
              <ul className="space-y-2 text-body-glass">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-innovation-magenta mr-2 mt-0.5 flex-shrink-0" />
                  Dark obsidian foundation (#0D1117) for sophistication
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent-azure mr-2 mt-0.5 flex-shrink-0" />
                  Blue/pink psychology (trust + innovation balance)
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-bridge-violet mr-2 mt-0.5 flex-shrink-0" />
                  Glassmorphism effects with backdrop-filter blur
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-innovation-rose mr-2 mt-0.5 flex-shrink-0" />
                  Premium gradients and glass overlays
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3 text-text-primary">Technical Features</h4>
              <ul className="space-y-2 text-body-glass">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent-sky mr-2 mt-0.5 flex-shrink-0" />
                  Inter Display for glass-optimized typography
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-bridge-lavender mr-2 mt-0.5 flex-shrink-0" />
                  Progressive enhancement for browser compatibility
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-innovation-pink mr-2 mt-0.5 flex-shrink-0" />
                  Mobile-optimized glass effects for performance
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent-azure mr-2 mt-0.5 flex-shrink-0" />
                  WCAG 2.1 AAA compliant contrast ratios
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    
  );
}