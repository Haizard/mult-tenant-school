# UI Design System - School Management System

## Overview
This document establishes the comprehensive UI design system for the Multi-Tenant School Management System, based on the modern glassmorphism aesthetic with light lavender backgrounds and translucent elements.

## Color Palette

### Primary Colors
- **Background Primary**: `#F8F6FF` - Light lavender base color
- **Background Secondary**: `#F0EDFF` - Slightly darker lavender for contrast
- **Background Tertiary**: `#E8E4FF` - Darker lavender for sidebar

### Accent Colors
- **Primary Purple**: `#6B46C1` - Deep purple for primary actions
- **Secondary Purple**: `#8B5CF6` - Medium purple for secondary elements
- **Success Green**: `#10B981` - Vibrant green for success states
- **Warning Yellow**: `#F59E0B` - Amber for warnings
- **Error Red**: `#EF4444` - Red for errors
- **Info Blue**: `#3B82F6` - Blue for informational elements

### Neutral Colors
- **Text Primary**: `#1F2937` - Dark gray for main text
- **Text Secondary**: `#6B7280` - Medium gray for secondary text
- **Text Tertiary**: `#9CA3AF` - Light gray for placeholder text
- **Border Light**: `#E5E7EB` - Light border color
- **Border Medium**: `#D1D5DB` - Medium border color

### Glassmorphism Colors
- **Glass Background**: `rgba(255, 255, 255, 0.25)` - Semi-transparent white
- **Glass Border**: `rgba(255, 255, 255, 0.18)` - Semi-transparent border
- **Glass Shadow**: `rgba(0, 0, 0, 0.1)` - Subtle shadow for depth

## Typography

### Font Family
- **Primary**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Secondary**: 'Roboto', sans-serif
- **Monospace**: 'JetBrains Mono', 'Fira Code', monospace

### Font Sizes
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Subsection headers
- **H4**: 1.25rem (20px) - Card titles
- **H5**: 1.125rem (18px) - Small headers
- **H6**: 1rem (16px) - Micro headers
- **Body Large**: 1.125rem (18px) - Important body text
- **Body**: 1rem (16px) - Standard body text
- **Body Small**: 0.875rem (14px) - Secondary text
- **Caption**: 0.75rem (12px) - Captions and labels

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **SemiBold**: 600
- **Bold**: 700

## Layout Structure

### Sidebar Design
- **Width**: 280px (desktop), 240px (tablet)
- **Background**: `#E8E4FF` with subtle gradient
- **Logo Area**: 80px height with school logo
- **Navigation**: Vertical menu with icons and labels
- **User Profile**: Bottom section with avatar and name

### Main Content Area
- **Background**: `#F8F6FF` with subtle pattern
- **Padding**: 24px (desktop), 16px (mobile)
- **Max Width**: 1400px with auto margins
- **Grid System**: 12-column responsive grid

### Header Bar
- **Height**: 64px
- **Background**: `rgba(255, 255, 255, 0.25)` with backdrop blur
- **Elements**: Search bar, notifications, user menu
- **Border**: Bottom border with `rgba(255, 255, 255, 0.18)`

## Component Design System

### Cards
- **Background**: `rgba(255, 255, 255, 0.25)` with backdrop blur
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 16px
- **Shadow**: `0 8px 32px rgba(0, 0, 0, 0.1)`
- **Padding**: 24px
- **Hover Effect**: Subtle scale (1.02) and enhanced shadow

### Buttons

#### Primary Button
- **Background**: Linear gradient from `#6B46C1` to `#8B5CF6`
- **Text Color**: White
- **Border**: None
- **Border Radius**: 12px
- **Padding**: 12px 24px
- **Font Weight**: 500
- **Shadow**: `0 4px 16px rgba(107, 70, 193, 0.3)`

#### Secondary Button
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Text Color**: `#6B46C1`
- **Border**: `1px solid rgba(107, 70, 193, 0.3)`
- **Border Radius**: 12px
- **Padding**: 12px 24px
- **Font Weight**: 500

#### Ghost Button
- **Background**: Transparent
- **Text Color**: `#6B46C1`
- **Border**: `1px solid rgba(107, 70, 193, 0.2)`
- **Border Radius**: 12px
- **Padding**: 12px 24px
- **Font Weight**: 500

### Form Elements

#### Input Fields
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 12px
- **Padding**: 16px
- **Focus State**: Enhanced border with `#6B46C1` and subtle glow
- **Placeholder**: `#9CA3AF`

#### Select Dropdowns
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 12px
- **Padding**: 16px
- **Dropdown**: Same styling with enhanced shadow

#### Checkboxes & Radio Buttons
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `2px solid rgba(107, 70, 193, 0.3)`
- **Border Radius**: 6px
- **Checked State**: `#6B46C1` background with white checkmark

### Navigation

#### Sidebar Navigation
- **Item Height**: 48px
- **Padding**: 12px 16px
- **Border Radius**: 12px
- **Active State**: `rgba(107, 70, 193, 0.1)` background
- **Hover State**: `rgba(107, 70, 193, 0.05)` background
- **Icon Size**: 20px
- **Icon Color**: `#6B7280`
- **Active Icon Color**: `#6B46C1`

#### Breadcrumbs
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 12px
- **Padding**: 12px 16px
- **Separator**: `#9CA3AF`

### Data Tables

#### Table Container
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 16px
- **Overflow**: Hidden

#### Table Header
- **Background**: `rgba(107, 70, 193, 0.05)`
- **Text Color**: `#6B46C1`
- **Font Weight**: 600
- **Padding**: 16px
- **Border Bottom**: `1px solid rgba(255, 255, 255, 0.18)`

#### Table Rows
- **Padding**: 16px
- **Border Bottom**: `1px solid rgba(255, 255, 255, 0.1)`
- **Hover State**: `rgba(107, 70, 193, 0.02)` background

### Modals & Overlays

#### Modal Background
- **Background**: `rgba(0, 0, 0, 0.5)` with backdrop blur
- **Animation**: Fade in/out

#### Modal Content
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Border Radius**: 20px
- **Shadow**: `0 20px 60px rgba(0, 0, 0, 0.3)`
- **Max Width**: 600px
- **Animation**: Scale and fade in

### Status Indicators

#### Success
- **Background**: `rgba(16, 185, 129, 0.1)`
- **Text Color**: `#10B981`
- **Border**: `1px solid rgba(16, 185, 129, 0.2)`

#### Warning
- **Background**: `rgba(245, 158, 11, 0.1)`
- **Text Color**: `#F59E0B`
- **Border**: `1px solid rgba(245, 158, 11, 0.2)`

#### Error
- **Background**: `rgba(239, 68, 68, 0.1)`
- **Text Color**: `#EF4444`
- **Border**: `1px solid rgba(239, 68, 68, 0.2)`

#### Info
- **Background**: `rgba(59, 130, 246, 0.1)`
- **Text Color**: `#3B82F6`
- **Border**: `1px solid rgba(59, 130, 246, 0.2)`

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

### Mobile Adaptations
- **Sidebar**: Collapsible drawer
- **Cards**: Full width with reduced padding
- **Typography**: Reduced font sizes
- **Spacing**: Reduced margins and padding

## Animation & Transitions

### Standard Transitions
- **Duration**: 200ms for micro-interactions, 300ms for page transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Hover Effects**: 150ms ease-in-out

### Page Transitions
- **Slide**: Horizontal slide for page navigation
- **Fade**: Fade in/out for modal overlays
- **Scale**: Scale effect for card interactions

## Accessibility

### Color Contrast
- **AA Compliance**: Minimum 4.5:1 contrast ratio
- **AAA Compliance**: Minimum 7:1 contrast ratio for important text

### Focus States
- **Outline**: `2px solid #6B46C1` with `2px` offset
- **Background**: Subtle highlight with `rgba(107, 70, 193, 0.1)`

### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Descriptive image alternatives

## Implementation Guidelines

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-bg-primary: #F8F6FF;
  --color-bg-secondary: #F0EDFF;
  --color-bg-tertiary: #E8E4FF;
  --color-primary: #6B46C1;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-shadow: rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --font-size-h3: 1.5rem;
  --font-size-body: 1rem;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

### Component Structure
Each component should follow this structure:
1. **Container**: Main wrapper with glassmorphism styling
2. **Header**: Title and actions
3. **Content**: Main content area
4. **Footer**: Additional actions or information

### State Management
- **Default**: Standard glassmorphism styling
- **Hover**: Subtle scale and enhanced shadow
- **Active**: Slightly darker background
- **Focus**: Enhanced border and glow
- **Disabled**: Reduced opacity and no interactions

This design system ensures consistency across all components while maintaining the modern, translucent aesthetic inspired by your color design image.
