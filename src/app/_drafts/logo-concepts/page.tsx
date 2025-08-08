import { LogoConceptShowcase, StellarNavigationCore, CosmicCircuitCompass, QuantumNetworkNode } from '@/components/ui/logo-concepts';
import { CosmicCShowcase, NebulaC, ConstellationC, CosmicPortalC, PortalCVariationsShowcase, CosmarcRefinedShowcase, CosmarcPortalRefined2Ring, CosmarcAuroraIcon } from '@/components/ui/cosmic-c-logo';
import { CosmicCVariationsShowcase } from '@/components/ui/cosmic-c-variations';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';

export default function LogoConceptsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            COSMARA Logo Evolution & Research-Optimized System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete research-driven logo development from initial concepts to final optimized system. 
            Features research-validated 2-ring design, enhanced scalability, and 5 brand color variants.
          </p>
        </div>

        {/* Current Logo Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Current vs. Proposed Concepts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Current Logo */}
            <div className="text-center">
              <div className="mb-4">
                <CosmaraLogo size={120} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Logo</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>✓ Connected constellation theme</div>
                <div>✓ Golden brand color</div>
                <div>⚠️ Complex with 8+ elements</div>
                <div>⚠️ Details lost at small sizes</div>
                <div>⚠️ Requires "COSMARA" text for recognition</div>
              </div>
            </div>

            {/* Recommended Concept */}
            <div className="text-center">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">COSMARA Portal C (Research-Optimized)</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>✓ Research-optimized 2-ring system</div>
                <div>✓ Enhanced stroke weights for 16px visibility</div>
                <div>✓ Geometric sans-serif typography</div>
                <div>✓ 5 brand color variants</div>
                <div>✓ Perfect scalability tested</div>
              </div>
            </div>
          </div>
        </div>

        {/* Research-Optimized COSMARA Logo System - FINAL RECOMMENDATIONS */}
        <CosmarcRefinedShowcase className="mb-12" />

        {/* NEW: Full Color Palette Variations */}
        <div className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            🎨 Complete COSMARA Color Palette Variations
          </h2>
          <p className="text-center text-gray-600 mb-8">
            All new variations utilizing our full brand color palette with orange gradients, stellar purple, and cosmic themes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Primary - Current with Orange Gradient */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="primary" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Primary (Updated)</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Orange gradient outer ring</div>
                <div>• Stellar purple inner ring</div>
                <div>• Orange gradient text</div>
                <div>• Black cosmic "O"</div>
              </div>
            </div>

            {/* Cosmic - Purple-Orange Fusion */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="cosmic" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Cosmic</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Purple gradient outer ring</div>
                <div>• Orange gradient inner ring</div>
                <div>• Purple gradient text</div>
                <div>• Golden cosmic "O" core</div>
              </div>
            </div>

            {/* Enterprise - Professional Gold-White */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="enterprise" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Enterprise</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Gold-to-white gradient outer</div>
                <div>• Stellar purple inner ring</div>
                <div>• Gold-to-white gradient text</div>
                <div>• Professional clean look</div>
              </div>
            </div>

            {/* Stellar - Golden Stellar Classic */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="stellar" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Stellar</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Pure golden outer ring</div>
                <div>• Purple gradient inner ring</div>
                <div>• Pure golden text</div>
                <div>• Classic cosmic elegance</div>
              </div>
            </div>

            {/* Aurora Full Logo - Warm-Cool Contrast */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="aurora" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Aurora Full Logo</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Full "COSMARA" spelling with cosmic "O"</div>
                <div>• Cool blue outer, orange inner C rings</div>
                <div>• Orange gradient text and cosmic "O"</div>
                <div>• Perfect brand name clarity</div>
              </div>
            </div>

            {/* Aurora Icon - Just Portal C + Cosmic O */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcAuroraIcon size={120} />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Aurora Icon</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Portal C rings + cosmic "O" only</div>
                <div>• Cool blue outer, orange inner C rings</div>
                <div>• Orange gradient cosmic "O"</div>
                <div>• Perfect for app icons & favicons</div>
              </div>
            </div>

            {/* Sunset - Warm Monochromatic */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <CosmarcPortalRefined2Ring size={120} variant="sunset" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Sunset</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Orange gradient outer ring</div>
                <div>• Pure golden inner ring</div>
                <div>• Orange gradient text</div>
                <div>• Warm monochromatic harmony</div>
              </div>
            </div>
          </div>

          {/* 3-Ring Variations */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">
              3-Ring System Variations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-gray-400 text-sm">(3-Ring variant placeholder)</div>
                <h4 className="font-medium text-gray-700">Cosmic 3-Ring</h4>
                <div className="text-xs text-gray-600">Purple-Orange-Purple layers</div>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-gray-400 text-sm">(3-Ring variant placeholder)</div>
                <h4 className="font-medium text-gray-700">Aurora 3-Ring</h4>
                <div className="text-xs text-gray-600">Orange-Blue-Purple layers</div>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-gray-400 text-sm">(3-Ring variant placeholder)</div>
                <h4 className="font-medium text-gray-700">Enterprise 3-Ring</h4>
                <div className="text-xs text-gray-600">Gold-Purple gradient layers</div>
              </div>
            </div>
          </div>

          {/* Color Strategy Notes */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-700 mb-3">Color Strategy Notes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Orange Gradient:</strong> Matches landing page COSMARA text gradient (#FFD700 → #FFA500 → #FF6B35)
              </div>
              <div>
                <strong>Stellar Purple:</strong> Cosmic theme color (#8B5CF6) for depth and sophistication
              </div>
              <div>
                <strong>Black Cosmic "O":</strong> Strong contrast element providing visual grounding
              </div>
              <div>
                <strong>White Core:</strong> Clean contrast ensuring readability across backgrounds
              </div>
            </div>
          </div>
        </div>

        {/* Cosmic C Concepts - NEW DIRECTION */}
        <CosmicCShowcase className="mb-12" />

        {/* Cosmic Portal C - Selected Design Variations */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
            ⭐ Cosmic Portal C - Selected Design Variations
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Multiple variations of the chosen Cosmic Portal C design with different depths and styles
          </p>
          <PortalCVariationsShowcase />
        </div>

        {/* Top 3 Preferred Concepts with Variations */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
            Previous Preferred Concepts - Variations & Black & White Versions
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Enhanced variations of the top 3 preferred cosmic "C" logo concepts with monochrome support
          </p>
          <CosmicCVariationsShowcase />
        </div>

        {/* Previous Abstract Concepts */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-center text-gray-600 mb-2">
            Previous Abstract Concepts (For Comparison)
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Initial explorations focusing on abstract cosmic patterns
          </p>
        </div>
        <LogoConceptShowcase />

        {/* Design Principles */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Research-Based Design Principles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3-5</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Simplified Elements</h3>
              <p className="text-sm text-gray-600">
                Maximum 3-5 visual elements for optimal memory retention and recognition
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Central Focus</h3>
              <p className="text-sm text-gray-600">
                Dominant central element (40%+ of logo area) for instant recognition
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">📱</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Perfect Scalability</h3>
              <p className="text-sm text-gray-600">
                Recognizable from 16px favicon to large displays without detail loss
              </p>
            </div>
          </div>
        </div>

        {/* Context Applications */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Logo Applications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Favicon */}
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-3">
                <CosmarcPortalRefined2Ring size={16} variant="primary" />
              </div>
              <h4 className="font-medium text-gray-700">Favicon</h4>
              <p className="text-xs text-gray-500">16x16px</p>
            </div>
            
            {/* Mobile App Icon */}
            <div className="text-center">
              <div className="bg-gray-800 p-4 rounded-lg mb-3">
                <CosmarcPortalRefined2Ring size={48} variant="primary" />
              </div>
              <h4 className="font-medium text-gray-700">App Icon</h4>
              <p className="text-xs text-gray-500">48x48px</p>
            </div>
            
            {/* Business Card */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg mb-3">
                <CosmarcPortalRefined2Ring size={32} variant="monochrome" />
              </div>
              <h4 className="font-medium text-gray-700">Business Card</h4>
              <p className="text-xs text-gray-500">Print Ready</p>
            </div>
            
            {/* Large Display */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-4 rounded-lg mb-3">
                <CosmarcPortalRefined2Ring size={64} variant="reverse" />
              </div>
              <h4 className="font-medium text-gray-700">Large Display</h4>
              <p className="text-xs text-gray-500">Presentations</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Recommended Next Steps
            </h2>
            <div className="max-w-2xl mx-auto text-gray-600 space-y-3">
              <p><strong>1. Select Preferred Concept:</strong> Choose the concept that best represents COSMARA's vision</p>
              <p><strong>2. Refinement Phase:</strong> Fine-tune colors, proportions, and animations</p>
              <p><strong>3. Implementation:</strong> Update across all platform touchpoints</p>
              <p><strong>4. A/B Testing:</strong> Test recognition with developer community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}