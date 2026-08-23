---
title: Theme System
tags: [architecture, design, theme, css, typography]
status: active
---

# 🎨 Theme System

> [[00_ManageMe_MOC]] → Technical Architecture → Theme System

## Overview

ManageMe's visual identity is built on a "Quiet Luxury" design philosophy — restrained neutral surfaces, a single signature accent color, and editorial-grade typography. The theme system supports seamless day/night mode switching via CSS custom properties and the `ThemeContext` React provider.

## Color Palette

### Light Mode — Apple Off-White

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FBFBFD` | Page background |
| `--card-bg` | `rgba(255,255,255,0.8)` | Card surfaces with glassmorphism |
| `--border-subtle` | `rgba(161,161,170,0.2)` | Hairline borders |
| `--text-primary` | `#1D1D1F` | Headings and body text |
| `--text-secondary` | `#71717A` | Captions and muted labels |
| `--accent-primary` | `#6366F1` | Royal Indigo — buttons, links, focus rings |

### Dark Mode — Deep Obsidian

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#09090B` | Page background |
| `--card-bg` | `rgba(24,24,27,0.8)` | Card surfaces with glassmorphism |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--text-primary` | `#F5F5F7` | Headings and body text |
| `--text-secondary` | `#A1A1AA` | Captions and muted labels |
| `--accent-primary` | `#818CF8` | Royal Indigo (lighter for dark bg) |

## Typography System

### Font Stack

| Token | Value |
|-------|-------|
| `--font-sans` | `'Plus Jakarta Sans', 'Geist', 'Inter', system-ui, sans-serif` |
| `--font-geist` | `'Geist', sans-serif` |
| `--font-serif` | `'Instrument Serif', Georgia, serif` |
| `--font-mono` | `'Space Mono', 'Geist Mono', monospace` |
| `--font-geist-mono` | `'Geist Mono', 'Space Mono', monospace` |

### Optical Kerning (Headings)

```css
h1, h2, h3, .heading-display {
  letter-spacing: -0.035em;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}
```

### Tabular Numerals (Financial Data)

```css
.tabular-numbers, .metric-value, .ticker-price {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  font-family: var(--font-geist-mono), monospace;
}
```

## Lenis Smooth Scroll

The entire application is wrapped in a `<SmoothScroll>` component powered by Lenis:

```typescript
new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});
```

- **Desktop**: Momentum-based smooth wheel interpolation (1.2s ease-out)
- **Mobile/Tablet**: Native touch scrolling preserved (Lenis auto-detects)

## Theme Toggle

The `ThemeContext` provider manages theme state:

```typescript
toggleTheme() → {
  1. Toggle 'dark' class on <html>
  2. Persist preference to localStorage('manageme-theme')
  3. Update context state
}
```

System preference is respected on first visit via `prefers-color-scheme: dark`.

## Spatial UI Primitives

### SpatialCard

3D perspective tilt card using Framer Motion spring physics:
- Rotation range: ±7° on both axes
- Spring config: `{ stiffness: 200, damping: 25 }`
- Glassmorphism: `backdrop-blur-2xl` with themed border

### Pill Badges (Hairline Micro-Blur)

```
backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05]
border border-zinc-900/[0.08] dark:border-white/[0.08]
```

## Key Files

- [`src/index.css`](file:///c:/Users/HP/.antigravity-ide/manageme/src/index.css) — Design tokens and `@layer base` typography
- [`src/app/globals.css`](file:///c:/Users/HP/.antigravity-ide/manageme/src/app/globals.css) — Next.js app directory tokens (mirrored)
- `src/context/ThemeContext.tsx` — React theme provider
- [`src/components/ui/SmoothScroll.tsx`](file:///c:/Users/HP/.antigravity-ide/manageme/src/components/ui/SmoothScroll.tsx) — Lenis wrapper
- [`src/components/ui/SpatialCard.tsx`](file:///c:/Users/HP/.antigravity-ide/manageme/src/components/ui/SpatialCard.tsx) — 3D tilt card
