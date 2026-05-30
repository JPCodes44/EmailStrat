---
name: Precision Outreach System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  inset-squish: 8px 12px
  inset-equal: 12px
---

## Brand & Style

The design system is engineered for a high-performance B2B environment where automation meets human oversight. The brand personality is **reliable, clinical, and protective**. It avoids the playful "magic" tropes of AI, instead positioning the platform as a sophisticated tool for surgical precision in communication.

The visual style is **Corporate / Modern**, characterized by:
- **High Data Density:** Interfaces are optimized for experts who need to see high-volume campaign metrics at a glance.
- **Safety-First Visuals:** Indicators for "Safety Checks," "Human-in-the-loop" states, and "Deliverability Health" are prioritized.
- **Non-Whimsical Execution:** Every element serves a functional purpose. Minimalist aesthetics are used to reduce cognitive load during complex workflow configurations.

## Colors

The palette is anchored in **Trust Blue (#2563EB)**, a color chosen for its association with professional stability and technical competence. 

- **Primary:** Used for high-intent actions (Launch Campaign, Approve Draft).
- **Secondary (Slate):** Used for iconography, secondary navigation, and meta-data to keep the UI grounded.
- **Backgrounds:** A tiered system using Slate-50 (#F8FAFC) for the canvas and White (#FFFFFF) for interactive surfaces like cards and tables.
- **Semantic Accents:** Success (Emerald) indicates healthy deliverability; Warning (Amber) indicates "Pause Recommended"; Error (Red) indicates hard bounces or API disconnects. 
- **Neutral Accents:** Used for "Draft" or "Inactive" states to prevent visual noise.

## Typography

This design system utilizes **Inter** for all UI roles to ensure maximum legibility and a neutral, systematic tone. 

- **Density-Focused:** The base body size is set to **14px (body-md)** to allow for more data-rich tables and dashboard views.
- **Technical Mono:** **JetBrains Mono** is introduced sparingly for technical logs, email headers (SMTP info), or variable placeholders (e.g., `{{first_name}}`) to distinguish system logic from human-readable content.
- **Hierarchy:** Headlines use a semi-bold weight (600) with slight negative letter-spacing to maintain a professional, sharp appearance at larger sizes.

## Layout & Spacing

The layout follows a **8px grid system** for consistent alignment, with a 4px sub-grid for tight component spacing.

- **Fixed Grid:** Dashboards use a max-width of 1440px to ensure data columns remain readable. Sidebars are fixed at 240px to maximize the workspace.
- **Compact Density:** Vertical spacing between table rows and list items is kept tight (8px to 12px) to allow users to scan 15+ records without scrolling.
- **Mobile Adaptivity:** For the mobile view, the layout reflows into a single-column stack, with margins increasing to 16px to ensure touch targets remain accessible, though the primary use case remains desktop-first.

## Elevation & Depth

Visual hierarchy is established primarily through **Tonal Layers** and subtle borders rather than aggressive shadows. This maintains a clean, "flat-plus" professional look.

- **Level 0 (Canvas):** The #F8FAFC background acts as the foundation.
- **Level 1 (Cards/Surfaces):** White cards with a 1px border (#E2E8F0). A very soft, 4% opacity shadow is used only to lift the card from the background.
- **Level 2 (Dropdowns/Modals):** These use a more distinct shadow (12% opacity, 16px blur) to indicate they are temporary overlays.
- **Active States:** Subtle inset shadows or 2px blue borders are used to show focus, reinforcing the "precision tool" feel.

## Shapes

The shape language is **Structured and Approachable**. 

- **Base Radius:** UI elements (buttons, inputs) utilize a **8px (0.5rem)** radius.
- **Large Radius:** Larger containers and cards utilize a **12px - 16px** radius to soften the high-density data layout and prevent the UI from feeling overly rigid or "Windows-95" brutalist.
- **Interactive States:** Buttons maintain sharp, clear boundaries to ensure their clickability is never in question.

## Components

### Buttons
- **Primary:** Solid #2563EB with white text. High contrast for "Launch" and "Save."
- **Secondary:** White background with #E2E8F0 border and #475569 text.
- **Danger:** Ghost style with red text, becoming solid on hover to prevent accidental deletions.

### Status Chips
- Small, uppercase labels with a subtle background tint of the status color (e.g., 10% Emerald background with 100% Emerald text). Used for "Sent," "Opened," "Replied," and "Bounced."

### Input Fields
- Standardized 40px height for primary forms, 32px height for density-focused filter bars.
- Borders use #CBD5E1, darkening to #2563EB on focus.

### Cards
- Used to group campaign stats. Includes a "header" area with a thin 1px bottom border. 

### Data Tables
- Row hover states are mandatory. 
- Use 12px padding on cells for a "Compact" feel.
- Column headers use **label-md** typography for clear distinction from data.

### Health Meters
- A custom component for "Sender Reputation," utilizing a segmented bar (Progress Bar) that transitions from Amber to Emerald, providing immediate visual feedback on account safety.