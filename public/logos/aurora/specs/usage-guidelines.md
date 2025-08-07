# Aurora Logo Usage Guidelines

## Quick Implementation Guide

### 1. Using Existing Components (Recommended)

**From Main Component File:**
```tsx
import { CosmarcPortalRefined2Ring, CosmarcAuroraIcon } from '@/components/ui/cosmic-c-logo';

// Aurora Full Logo
<CosmarcPortalRefined2Ring 
  size={320} 
  variant="aurora"
  className="aurora-logo"
  showLabel={false}
/>

// Aurora Icon
<CosmarcAuroraIcon 
  size={128}
  className="aurora-icon"
  showLabel={false}
/>
```

**From Aurora Component Files:**
```tsx
import { AuroraFullLogo } from './public/logos/aurora/components/aurora-full-logo';
import { AuroraIcon } from './public/logos/aurora/components/aurora-icon';

<AuroraFullLogo size={320} />
<AuroraIcon size={128} />
```

### 2. Direct Analysis & Testing

Visit `/aurora-logo-analysis` to see live implementations and test different configurations.

## Logo Selection Guide

### When to Use Aurora Full Logo

#### ✅ **Primary Use Cases**
- **Website Headers**: Main navigation and branding
- **Marketing Materials**: Presentations, brochures, advertisements
- **Email Signatures**: Professional correspondence
- **Documentation**: User guides, API documentation
- **Large Format**: Posters, banners, conference displays
- **Brand Guidelines**: Official brand documentation

#### ✅ **Optimal Sizes**
- **Minimum**: 200px width (maintains text readability)
- **Standard**: 320px - 480px (recommended for most uses)
- **Large**: 640px+ (high-resolution displays, print materials)

#### ✅ **Context Requirements**
- Sufficient horizontal space for full "COSMARA" text
- High contrast background for text readability
- Primary brand positioning contexts

### When to Use Aurora Icon

#### ✅ **Primary Use Cases**
- **Favicons**: Browser tabs and bookmarks (16px - 32px)
- **App Icons**: Mobile and desktop applications (64px - 256px)
- **Social Media**: Profile images, avatars (128px - 256px)
- **Navigation Elements**: Compact logo representations
- **Loading Indicators**: Branded loading animations
- **Watermarks**: Subtle brand presence

#### ✅ **Optimal Sizes**
- **Favicon**: 16px - 32px (minimum viable size)
- **Small Icon**: 64px - 128px (UI elements, thumbnails)
- **Standard Icon**: 128px - 256px (app icons, profiles)
- **Large Icon**: 256px+ (detailed icon presentations)

#### ✅ **Context Requirements**
- Limited horizontal space
- Need for simple, recognizable symbol
- Square or compact rectangular layouts

## Brand Guidelines

### Color Specifications

#### Aurora Color Palette
- **Primary Blue**: `#3B82F6` → `#1E40AF` → `#1E3A8A` (Portal outer ring)
- **Primary Orange**: `#FFD700` → `#FFA500` → `#FF6B35` (Portal inner ring, Cosmic "O", Text)
- **White Underlay**: `#FFFFFF` at 80-90% opacity (universal compatibility)

#### Background Compatibility
- **✅ Light Backgrounds**: Full compatibility with white stroke underlay
- **✅ Dark Backgrounds**: Full compatibility with white stroke underlay
- **✅ Colored Backgrounds**: Universal compatibility across all color schemes
- **✅ Images**: White stroke ensures visibility over complex backgrounds
- **✅ Gradients**: Maintains visibility across gradient transitions

### Clear Space Requirements

#### Minimum Clear Space
- **Full Logo**: Equivalent to cosmic "O" radius on all sides
- **Icon**: Equivalent to 25% of icon size on all sides
- **Never** place other elements within the clear space
- **Always** maintain clear space even in crowded layouts

#### Size Restrictions
- **Full Logo Minimum**: 200px width (text readability threshold)
- **Icon Minimum**: 16px (favicon compatibility)
- **Maximum**: No upper limit - logo scales infinitely
- **Aspect Ratio**: Always maintain original proportions

### Proper Usage Examples

#### ✅ **Correct Usage**
```tsx
// Website Header
<header className="bg-white">
  <AuroraFullLogo size={320} />
</header>

// App Icon
<div className="w-16 h-16">
  <AuroraIcon size={64} />
</div>

// Email Signature
<AuroraFullLogo size={240} className="mb-4" />

// Favicon (HTML)
<link rel="icon" type="image/svg+xml" href="/aurora-icon.svg" sizes="32x32">
```

#### ❌ **Incorrect Usage**
- Stretching or distorting logo proportions
- Using non-Aurora color variants for official branding
- Placing logo on backgrounds without sufficient contrast
- Using full logo in spaces too small for text readability
- Modifying gradient colors or positioning
- Adding drop shadows or effects that alter the design

### Technical Implementation

#### SVG Optimization
- Use components for dynamic sizing and optimal performance
- Maintain gradient definitions for consistent color rendering
- Preserve `gradientUnits="userSpaceOnUse"` for accurate positioning
- Keep white stroke underlay for universal compatibility

#### File Export Guidelines
- **SVG**: Preferred for web and scalable applications
- **PNG**: High-resolution exports for specific use cases
- **Vector**: Maintain original mathematical precision
- **Raster**: Export at 2x resolution for high-DPI displays

#### Performance Considerations
- Components use pre-calculated values for optimal rendering
- Tree-shakeable imports for bundle size optimization
- Minimal DOM elements with efficient SVG structure
- Hardware-accelerated CSS transforms where applicable

## Brand Voice Integration

### Visual Messaging
The Aurora logo represents:
- **Innovation**: Cosmic theme suggests advanced technology
- **Reliability**: Mathematical precision conveys trustworthiness  
- **Accessibility**: Universal background compatibility shows inclusivity
- **Quality**: Professional polish reflects premium positioning

### Context Alignment
- **Technical Documentation**: Emphasizes precision and reliability
- **Marketing Materials**: Highlights innovation and quality
- **User Interfaces**: Provides recognizable, accessible branding
- **Corporate Communications**: Conveys professionalism and stability

## Legal & Compliance

### Trademark Usage
- Always use official Aurora logo variants
- Include trademark disclaimer when required: "COSMARA and Aurora logo are trademarks of [Company Name]"
- Maintain logo integrity - no modifications or custom variants
- Follow brand guidelines for co-branding situations

### Quality Control
- Regular audits to ensure consistent usage across all materials
- Version control for logo updates and modifications
- Brand guideline training for team members using the logo
- Documentation of approved use cases and examples

---

*Usage guidelines established August 2025 - Aurora Logo System*