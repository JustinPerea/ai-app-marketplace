import { CosmarcPortalRefined2Ring, CosmarcAuroraIcon } from '@/components/ui/cosmic-c-logo';

export default function AuroraLogoAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Aurora Full Logo Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete technical breakdown of the Aurora Full Logo implementation
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-12 mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Aurora Logo Comparison - Full Logo vs Icon
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Aurora Full Logo */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-gray-700">Aurora Full Logo</h3>
              <div className="flex justify-center mb-6">
                <CosmarcPortalRefined2Ring size={320} variant="aurora" />
              </div>
              <div className="text-sm text-gray-600">
                <p>Component: <code>CosmarcPortalRefined2Ring</code></p>
                <p>Size: 320px (maximized)</p>
                <p>Variant: "aurora"</p>
                <p className="mt-2 text-green-600">✓ Background gradient</p>
                <p className="text-green-600">✓ White circle + yellow fill</p>
                <p className="text-green-600">✓ Cosmic "O" white center</p>
              </div>
            </div>

            {/* Aurora Icon */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-gray-700">Aurora Icon (Fixed)</h3>
              <div className="flex justify-center mb-6">
                <CosmarcAuroraIcon size={320} />
              </div>
              <div className="text-sm text-gray-600">
                <p>Component: <code>CosmarcAuroraIcon</code></p>
                <p>Size: 320px (maximized)</p>
                <p>No variant needed</p>
                <p className="mt-2 text-green-600">✓ Background gradient</p>
                <p className="text-green-600">✓ White circle + yellow fill</p>
                <p className="text-green-600">✓ Cosmic "O" white center</p>
                <p className="mt-2 text-xs text-blue-600">Fixed: Resolved SVG gradient ID conflict</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation Details */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Complete Technical Implementation
          </h2>
          
          {/* Constants and Calculations */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Constants & Calculations</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`const strokeWidth = size * 0.04; // Increased for better scalability
const radius = size * 0.18; // Reverted back to proper size
const fontSize = size * 0.12;

// Calculated positioning for perfect grid alignment
const portalTransformY = size * 0.1; // Portal C transform Y position
const cosmicOCenterY = portalTransformY + radius * 1.4; // Actual cosmic "O" center position
const textBaselineY = cosmicOCenterY + fontSize * 0.35; // Align text baseline with cosmic "O" center
const portalCenterX = size * 0.0 + radius * 1.15; // Portal C center for text positioning`}
              </pre>
            </div>
          </div>

          {/* SVG Structure */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">SVG Structure</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`<svg width={size * 1.8} height={size * 0.8} viewBox={\`0 0 \${size * 1.8} \${size * 0.8}\`} className="drop-shadow-lg">`}
              </pre>
            </div>
          </div>

          {/* Aurora Color Scheme */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Aurora Color Scheme</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`aurora: {
  outerRing: 'url(#cosmicBlueGradient)',
  innerRing: 'url(#cosmaraOrangeGradient)',
  core: '#FFFFFF',
  coreAccent: '#FFD700',
  text: 'url(#cosmaraOrangeGradient)',
  background: 'transparent',
  cosmicO: 'url(#cosmaraOrangeGradient)'
}`}
              </pre>
            </div>
          </div>

          {/* Portal C Structure */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Portal C Transform & Structure</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`{/* Portal C */}
<g transform={\`translate(\${size * 0.0}, \${portalTransformY})\`}>
  {/* Portal Background - Subtle circular glow behind Portal C rings */}
  <circle 
    cx={radius * 1.15} 
    cy={radius * 1.4} 
    r={radius * 1.2} 
    fill="url(#cosmaraPortalGradient2Ring)"
    opacity="0.4"
    filter="url(#cosmicGlow2Ring)"
  />
  
  {/* 2-Ring Portal C Structure - Mathematical precision for concentric alignment */}
  <g fill="none" strokeLinecap="round">
    {/* Outer C Ring - Opens right (proper "C" orientation) */}
    <path
      d={\`M \${radius * 1.15 + Math.cos(-Math.PI * 0.25) * radius * 1.0} \${radius * 1.4 + Math.sin(-Math.PI * 0.25) * radius * 1.0}
         A \${radius * 1.0} \${radius * 1.0} 0 1 0 \${radius * 1.15 + Math.cos(Math.PI * 0.25) * radius * 1.0} \${radius * 1.4 + Math.sin(Math.PI * 0.25) * radius * 1.0}\`}
      stroke={colors.outerRing}
      strokeWidth={strokeWidth * 1.2}
      opacity="0.9"
    />
    
    {/* Inner C Ring - Concentric with outer ring, exact mathematical spacing */}
    <path
      d={\`M \${radius * 1.15 + Math.cos(-Math.PI * 0.25) * radius * 0.7} \${radius * 1.4 + Math.sin(-Math.PI * 0.25) * radius * 0.7}
         A \${radius * 0.7} \${radius * 0.7} 0 1 0 \${radius * 1.15 + Math.cos(Math.PI * 0.25) * radius * 0.7} \${radius * 1.4 + Math.sin(Math.PI * 0.25) * radius * 0.7}\`}
      stroke={colors.innerRing}
      strokeWidth={strokeWidth * 0.8}
      opacity="0.8"
    />
  </g>
  
  {/* Core of the Portal - Central accent point */}
  <circle 
    cx={radius * 1.15} 
    cy={radius * 1.4} 
    r={radius * 0.25} 
    fill={colors.core}
    opacity="0.8"
  />
  <circle 
    cx={radius * 1.15} 
    cy={radius * 1.4} 
    r={radius * 0.12} 
    fill={colors.coreAccent}
    opacity="0.9"
  />
</g>`}
              </pre>
            </div>
          </div>

          {/* Text Implementation */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Text Implementation (COSMARA Letters)</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`{/* Text "COSMARA" with perfect grid alignment */}
<g>
  {/* "C" letter positioned inside Portal C rings */}
  <text
    x={portalCenterX}
    y={textBaselineY}
    fontSize={fontSize * 1.1}
    fontFamily="ui-sans-serif, system-ui, sans-serif"
    fontWeight="600"
    fill={colors.text}
    textAnchor="middle"
    opacity="0.9"
  >
    C
  </text>
  
  {/* "OSMARA" letters with consistent spacing */}
  <text
    x={portalCenterX + fontSize * 2.0}
    y={textBaselineY}
    fontSize={fontSize * 1.1}
    fontFamily="ui-sans-serif, system-ui, sans-serif"
    fontWeight="600"
    fill={colors.text}
    textAnchor="start"
    opacity="0.9"
  >
    SMARA
  </text>
</g>`}
              </pre>
            </div>
          </div>

          {/* Cosmic O Implementation */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Cosmic "O" Implementation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`{/* Cosmic "O" positioned naturally where "O" letter would be */}
<g>
  {/* Outer cosmic "O" ring */}
  <circle 
    cx={portalCenterX + fontSize * 1.0}
    cy={cosmicOCenterY}
    r={fontSize * 0.42}
    fill="none"
    stroke={colors.cosmicO}
    strokeWidth={fontSize * 0.14}
    opacity="0.9"
  />
  
  {/* Inner cosmic "O" core */}
  <circle 
    cx={portalCenterX + fontSize * 1.0}
    cy={cosmicOCenterY}
    r={fontSize * 0.18}
    fill={colors.core}
    opacity="0.7"
  />
</g>`}
              </pre>
            </div>
          </div>

          {/* Key Measurements */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Key Measurements for Aurora Icon</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Critical Values for Icon Version:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li><strong>Portal C Transform:</strong> <code>translate(0, 20)</code> (size * 0.0, size * 0.1)</li>
                <li><strong>Cosmic "O" X Position:</strong> <code>portalCenterX + fontSize * 1.0</code> = <code>41.4 + 24</code> = <code>65.4</code></li>
                <li><strong>Cosmic "O" Y Position:</strong> <code>cosmicOCenterY</code> = <code>portalTransformY + radius * 1.4</code> = <code>20 + 50.4</code> = <code>70.4</code></li>
                <li><strong>SVG Dimensions:</strong> <code>width=360, height=160</code> (size * 1.8, size * 0.8)</li>
              </ul>
            </div>
          </div>

          {/* Implementation Note */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">For Aurora Icon Implementation:</h4>
            <p className="text-sm text-blue-700">
              The Aurora Icon should use the exact same Portal C structure and cosmic "O" positioning as shown above, 
              but simply remove the two text elements (the "C" and "SMARA" text). All other positioning, measurements, 
              colors, and structure should remain identical.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}