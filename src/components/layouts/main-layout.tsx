import { Navigation } from './navigation';
import { SkipNavigation } from '../ui/skip-nav';
import { ProviderStatusBar } from '@/components/provider-status-bar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <SkipNavigation />
      <Navigation />
      {/* <ProviderStatusBar /> */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/security" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="/integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Developers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/developers" className="hover:text-foreground transition-colors">Developer Portal</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="/sdk" className="hover:text-foreground transition-colors">SDK</a></li>
                <li><a href="/api" className="hover:text-foreground transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/help" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="/community" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="/legal" className="hover:text-foreground transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 AI App Marketplace. Built for the future of AI applications.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}