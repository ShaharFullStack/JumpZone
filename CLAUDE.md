# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew RTL (right-to-left) landing page for "Jump Zone" - a jump rope fitness training business. The site features a full-screen section-based design with smooth scroll animations and mobile optimization.

## Architecture

### Core Technologies
- **Frontend**: Pure HTML, CSS, JavaScript (no build process required)
- **3D Graphics**: Three.js (CDN) for background canvas animations
- **Styling**: Tailwind CSS (CDN) + custom CSS for responsive design
- **Font**: Heebo (Google Fonts) for Hebrew text support

### File Structure
- `index.html` - Main page with embedded JavaScript for scroll mechanics
- `styles.css` - Custom CSS with extensive mobile responsiveness
- `script.js` - JavaScript utilities for accessibility and animations
- `leads.html` - Secondary page for lead management
- `accessibility.html` - Accessibility features page
- `assets/` - Media files (videos, images, icons)

### Key Design Patterns

**Section-Based Navigation**: Uses `#sections-container` with CSS transforms to create "jump" scrolling between full-screen sections. Each section is 100vh height.

**Mobile-First Responsive**: Extensive CSS media queries optimize for mobile devices with specific handling for:
- Dynamic viewport height (`100dvh`)
- Safe area insets for notched devices
- Touch-friendly button sizing (44px minimum)
- Micro navigation dots (3-4px on mobile)

**RTL Support**: Full Hebrew language support with `dir="rtl"` and appropriate text alignment.

## Development Commands

This is a static website with no build process. To develop:

1. **Local Development**: Open `index.html` directly in a browser
2. **Testing**: Test responsive design using browser dev tools
3. **Mobile Testing**: Use device simulation or actual mobile devices

## Key Components

### Scroll System (`index.html:179-287`)
- Wheel, touch, and keyboard navigation between sections
- Debounced scrolling to prevent rapid section jumping
- Navigation dots with active state management

### Responsive Breakpoints
- **Desktop**: Default styles
- **Tablet**: `@media (max-width: 768px)`
- **Mobile**: `@media (max-width: 480px)`
- **Small Mobile**: `@media (max-width: 375px)`

### Video Backgrounds
Uses HTML5 video with fallback poster images. Videos are positioned with `z-index: -1` to stay behind content.

## Accessibility Features (`script.js`)
- High contrast mode toggle
- Font size adjustment (12px-24px range)
- Screen reader compatible navigation
- Keyboard navigation support
- Touch-friendly interface elements

## Content Management

### WhatsApp Integration
Contact buttons link directly to WhatsApp with pre-filled messages in Hebrew. Links use `wa.me` format with URL-encoded Hebrew text.

### Pricing Table (`index.html:118-135`)
Responsive table showing training session types and prices in Israeli Shekels (₪).

## Mobile Optimization Notes

The site heavily prioritizes mobile experience:
- Hero section maintains prominence on all screen sizes
- Other sections scale down content to fit mobile viewports
- Navigation dots become extremely small (3-4px) on mobile
- Tables and grids automatically collapse to single columns
- Touch targets meet 44px minimum accessibility requirements

## Performance Considerations

- Three.js pixel ratio limited to 2x on mobile for performance
- CSS animations use `will-change` and `backface-visibility` optimizations
- Videos use `playsinline` attribute for iOS compatibility
- Images use optimized loading and rendering hints for high-DPI displays