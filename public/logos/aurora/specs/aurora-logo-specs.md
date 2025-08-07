# Aurora Logo Technical Specifications

## Mathematical Foundation

### Scaling System
- **Base Unit**: Size parameter (e.g., 320px)
- **Stroke Width**: `size * 0.04` (4% of base size)
- **Radius**: `size * 0.18` (18% of base size)
- **Font Size**: `size * 0.12` (12% of base size)

### Portal C Ring Specifications

#### Outer Ring (Blue)
- **Radius**: `radius * 1.0` (100% of base radius)
- **Stroke Width**: `strokeWidth * 1.2` (120% of base stroke)
- **Arc Range**: -42.3° to +42.3° (84.6° total opening)
- **Color**: Cosmic blue gradient (`#3B82F6` → `#1E40AF` → `#1E3A8A`)
- **White Underlay**: +2px stroke width at 80% opacity

#### Inner Ring (Orange)
- **Radius**: `radius * 0.7` (70% of base radius)
- **Stroke Width**: `strokeWidth * 0.8` (80% of base stroke)
- **Arc Range**: -55.0° to +55.0° (110° total opening)
- **Color**: COSMARA orange gradient (`#FFD700` → `#FFA500` → `#FF6B35`)
- **White Underlay**: +2px stroke width at 80% opacity

### Cosmic "O" Specifications

#### Dimensions
- **Radius**: `fontSize * 0.55` (55% of font size)
- **Stroke Width**: `fontSize * 0.08 + 1.5` (responsive thickness)
- **Fill**: None (empty circle design)
- **Color**: COSMARA orange gradient (matching inner ring)
- **White Underlay**: +1px stroke width at 80% opacity

#### Positioning (Aurora Spacing Orchestration)
- **X Position**: `portalCenterX + (radius * 0.65)` (65% offset from portal center)
- **Y Position**: `portalCenterY` (aligned with Portal C rings center)
- **Grid Alignment**: 19.564px offset calculation for perfect orange ring alignment

### Typography Specifications

#### "C" Text
- **Font Size**: `fontSize * 1.1` (110% of base font)
- **Position X**: `35.54 + 19.564 - 18` (grid-aligned with mathematical precision)
- **Position Y**: `portalCenterY + fontSize * 0.35` (baseline alignment)
- **Color**: Unified COSMARA gradient
- **White Underlay**: 2px stroke at 90% opacity

#### "SMARA" Text
- **Font Size**: `fontSize * 1.1` (110% of base font)
- **Letter Spacing**: `0.12em` (professional typography)
- **Position X**: `cosmicORightEdge + (fontSize * 0.12)` (12% gap from cosmic "O")
- **Position Y**: `portalCenterY + fontSize * 0.35` (baseline alignment)
- **Width**: `fontSize * 3.8` (total text width including spacing)
- **Color**: Unified gradient spanning from "C" to "SMARA" end
- **White Underlay**: 2px stroke at 90% opacity

### SVG Structure & Centering

#### Dynamic Dimensions
- **Width Calculation**: 
  ```
  minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2
  maxX = textSPosition + fontSize * 3.8
  logoWidth = maxX - minX
  svgWidth = logoWidth * 1.24  // 12% padding
  ```

- **Height Calculation**:
  ```
  minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2
  maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2
  logoHeight = maxY - minY
  svgHeight = logoHeight * 1.24  // 12% padding
  ```

#### Transform Positioning
- **X Transform**: `padding - minX` (centers horizontally with 12% padding)
- **Y Transform**: `padding - minY` (centers vertically with 12% padding)

### Gradient Definitions

#### Cosmic Blue Gradient
```svg
<linearGradient id="cosmicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#3B82F6"/>
  <stop offset="50%" stopColor="#1E40AF"/>
  <stop offset="100%" stopColor="#1E3A8A"/>
</linearGradient>
```

#### COSMARA Orange Gradient
```svg
<linearGradient id="cosmaraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#FFD700"/>
  <stop offset="50%" stopColor="#FFA500"/>
  <stop offset="100%" stopColor="#FF6B35"/>
</linearGradient>
```

#### Unified Text Gradient
```svg
<linearGradient 
  id="unifiedTextGradient" 
  x1={textCPosition} 
  y1={textBaselineY} 
  x2={textSPosition + fontSize * 3.8} 
  y2={textBaselineY} 
  gradientUnits="userSpaceOnUse">
  <stop offset="0%" stopColor="#FFD700"/>
  <stop offset="50%" stopColor="#FFA500"/>
  <stop offset="100%" stopColor="#FF6B35"/>
</linearGradient>
```

## Precision Measurements (320px Base)

### Portal C Rings
- **Outer Ring Radius**: 57.6px
- **Inner Ring Radius**: 40.32px
- **Ring Gap**: 2.8px (mathematical precision)
- **Portal Center**: (66.24px, 80.64px)

### Cosmic "O"
- **Radius**: 21.12px
- **Center Position**: (103.68px, 80.64px)
- **Grid Alignment Offset**: 19.564px

### Text Elements
- **"C" Position**: (37.104px, 94.86px)
- **"SMARA" Start**: (129.216px, 94.86px)
- **Font Size**: 38.4px
- **Total Text Width**: 145.92px

### SVG Container
- **Width**: 346.08px (with 12% padding)
- **Height**: 180.48px (with 12% padding)
- **Padding**: 20.736px on all sides

## Quality Assurance Checkpoints

### Visual Verification
- [ ] Cosmic "O" aligns with orange ring grid
- [ ] Empty circle design (no fill)
- [ ] Unified gradient flows seamlessly
- [ ] Universal background compatibility
- [ ] No element cutoff at any size
- [ ] Perfect centering in SVG bounds

### Technical Verification
- [ ] No template literal complexity
- [ ] Pre-calculated dimensions
- [ ] Proper transform positioning  
- [ ] Clean gradient definitions
- [ ] Optimized rendering performance
- [ ] Cross-browser compatibility

### Responsive Testing
- [ ] 16px (favicon minimum)
- [ ] 64px (small icon)
- [ ] 128px (standard icon)
- [ ] 320px (standard logo)
- [ ] 640px+ (large displays)

---

*Technical specifications validated August 2025*