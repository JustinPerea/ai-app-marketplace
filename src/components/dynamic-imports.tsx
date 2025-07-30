import dynamic from 'next/dynamic';
import { AppCardSkeleton, DashboardStatSkeleton } from './ui/lazy-load';

// Lazy load heavy components with custom loading states
export const DynamicApiKeyForm = dynamic(
  () => import('./features/api-key-form').then(mod => ({ default: mod.ApiKeyForm })),
  {
    loading: () => (
      <div className="border rounded-lg p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="flex justify-end space-x-2">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    ),
    ssr: false, // Form components often need client-side hydration
  }
);

// Dynamic chart components (if we add charts later)
export const DynamicUsageChart = dynamic(
  () => import('./features/usage-chart').catch(() => ({ default: () => <div>Chart loading...</div> })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAnalyticsChart = dynamic(
  () => import('./features/analytics-chart').catch(() => ({ default: () => <div>Analytics loading...</div> })),
  {
    loading: () => (
      <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    ),
    ssr: false,
  }
);

// Dynamic code editor for developer portal
export const DynamicCodeEditor = dynamic(
  () => import('./features/code-editor').catch(() => ({ default: () => <div>Code editor loading...</div> })),
  {
    loading: () => (
      <div className="h-96 bg-gray-900 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading code editor...</div>
      </div>
    ),
    ssr: false,
  }
);

// Dynamic image gallery for app screenshots
export const DynamicImageGallery = dynamic(
  () => import('./features/image-gallery').catch(() => ({ default: () => <div>Gallery loading...</div> })),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    ),
    ssr: false,
  }
);

// Heavy dashboard components
export const DynamicDashboardStats = dynamic(
  () => import('./features/dashboard-stats').catch(() => ({ default: () => <div>Stats loading...</div> })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <DashboardStatSkeleton key={i} />
        ))}
      </div>
    ),
  }
);

// Developer portal components
export const DynamicDeveloperDashboard = dynamic(
  () => import('./features/developer-dashboard').catch(() => ({ default: () => <div>Dashboard loading...</div> })),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <AppCardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <DashboardStatSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

// Export all for easy importing
export {
  DynamicApiKeyForm as ApiKeyForm,
  DynamicUsageChart as UsageChart,
  DynamicAnalyticsChart as AnalyticsChart,
  DynamicCodeEditor as CodeEditor,
  DynamicImageGallery as ImageGallery,
  DynamicDashboardStats as DashboardStats,
  DynamicDeveloperDashboard as DeveloperDashboard,
};