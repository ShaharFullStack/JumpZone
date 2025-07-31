# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew-language fitness coaching landing page for "Jump Zone" - a jump rope training business. It's a static website built with vanilla HTML, CSS, and JavaScript, designed for Firebase Hosting deployment.

## Architecture

### Static Site Structure
- **No build system** - direct file editing and deployment
- **Firebase Hosting** configured for static file serving
- **Firestore database** integration for form submissions
- **Admin panel** at `leads.html` for lead management (password protected)

### Core Technologies
- **HTML5** with semantic structure and RTL Hebrew support
- **CSS3** with modern features (Grid, Flexbox, dark theme)
- **Vanilla JavaScript** (ES6+) with Firebase 9.22.2
- **Font Awesome 6.5.1** for icons

## Key Technical Considerations

### Hebrew Language Support
- **RTL (Right-to-Left) text direction** throughout
- Hebrew content requires special attention to text alignment
- Navigation and layout elements designed for RTL reading flow
- Use `text-align: right` for Hebrew paragraphs in content sections

### Responsive Design Patterns
- **Mobile-first approach** with dark theme (#18191a background)
- **Fixed header** (58px height) - account for `margin-top: 58px` on main content
- **Card-based layouts** with hover effects and shadow styling
- **Gradient backgrounds** using brand colors (#e74c3c, #23272f, #18191a)

### Firebase Integration
- **Firestore** configured for contact form submissions
- **Firebase config** in `script.js` - maintain API key security
- **Admin authentication** for leads access - password stored in code
- Form validation and success/error messaging in Hebrew

### Accessibility Implementation
- **UserWay widget** integrated for accessibility features
- **High contrast mode** and font size adjustment capabilities
- **Focus indicators** with yellow outline styling
- **Semantic HTML** structure for screen readers

## Development Workflow

### File Structure
- `index.html` - Main landing page (405 lines)
- `styles.css` - Complete styling with dark theme (800+ lines)
- `script.js` - Firebase integration and form handling (114 lines)
- `leads.html` - Admin panel for form submissions
- `accessibility.html` - Accessibility declaration page

### Common Tasks
- **Style modifications**: Edit `styles.css` directly
- **Content updates**: Modify Hebrew content in `index.html`
- **Form handling**: Update Firebase logic in `script.js`
- **Testing**: Open files directly in browser (no build step)

### Brand Guidelines
- **Primary color**: #e74c3c (red/coral)
- **Background**: #18191a (dark)
- **Cards/sections**: #23272f (lighter dark)
- **Text**: #f3f3f3 (light gray) and #fff (white)
- **Hover effects**: Scale transforms and color transitions

## Business Context

### Target Audience
- Hebrew-speaking fitness enthusiasts
- All ages and fitness levels
- Focus on mental health benefits alongside physical training
- Accessibility-conscious community

### Content Sections
1. **Hero** with trainer story and main CTA
2. **About sections** (business, trainer, process)
3. **Services** with detailed pricing table
4. **Testimonials** with customer photos
5. **FAQ** addressing common concerns
6. **Contact form** with WhatsApp integration

### Lead Management
- Form submissions stored in Firestore
- Admin panel accessible via password
- Lead data includes contact info and selected services
- WhatsApp integration for direct communication

## Firebase Configuration

### Database Structure
- Collection: `leads` (contact form submissions)
- Fields: name, phone, email, service, message, timestamp
- Admin access via password authentication in `leads.html`

### Security Considerations
- Admin password hardcoded (consider environment variables for production)
- Firebase API key exposed in client-side code (standard for web apps)
- No user authentication system - simple password protection for admin

## Accessibility Compliance

- UserWay accessibility widget provides contrast, font size, and navigation assistance
- Semantic HTML structure with proper heading hierarchy
- Focus indicators for keyboard navigation
- Alt text for images (hero logo, testimonial photos)
- Accessibility declaration page as required by Israeli law