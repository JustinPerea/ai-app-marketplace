import { MainLayout } from '@/components/layouts/main-layout';
import { OllamaSetupWizard } from '@/components/ai/setup-wizard';

export default function OllamaSetupPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ollama Setup Wizard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get optimal AI performance with hardware-specific optimization. 
              Our system automatically detects your capabilities and configures 
              the best settings for your setup.
            </p>
          </div>
          
          <OllamaSetupWizard />
          
          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">80% Faster</h3>
                <p className="text-sm text-gray-600">
                  Context window optimization provides immediate speed improvements
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Hardware Optimized</h3>
                <p className="text-sm text-gray-600">
                  Adaptive configuration based on your system's capabilities
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="font-semibold mb-2">Universal Support</h3>
                <p className="text-sm text-gray-600">
                  Works on any hardware from laptops to high-end servers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}