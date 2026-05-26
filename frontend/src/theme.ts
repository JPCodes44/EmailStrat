/**
 * Design tokens — reference values for the app's component stylesheets.
 * Component styling lives in folder-local CSS files under `src/components/`.
 *
 * The palette/typography implement the "Precision Outreach System" design
 * (see src/design/stitch_agentic_outreach_pipeline/DESIGN.md).
 */
const sans = "'Inter', system-ui, -apple-system, sans-serif";
const mono = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const icon = "'Material Symbols Outlined'";

export const theme = {
  colors: {
    // Tonal surfaces
    background: '#f7f9fb',
    onBackground: '#191c1e',
    surface: '#f7f9fb',
    surfaceDim: '#d8dadc',
    surfaceVariant: '#e0e3e5',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f4f6',
    surfaceContainer: '#eceef0',
    surfaceContainerHigh: '#e6e8ea',
    surfaceContainerHighest: '#e0e3e5',
    onSurface: '#191c1e',
    onSurfaceVariant: '#434655',
    outline: '#737686',
    outlineVariant: '#c3c6d7',
    // Primary (Trust Blue)
    primary: '#004ac6',
    onPrimary: '#ffffff',
    primaryContainer: '#2563eb',
    onPrimaryContainer: '#eeefff',
    primaryFixed: '#dbe1ff',
    primaryFixedDim: '#b4c5ff',
    onPrimaryFixedVariant: '#003ea8',
    // Secondary (Slate)
    secondary: '#505f76',
    onSecondary: '#ffffff',
    secondaryContainer: '#d0e1fb',
    onSecondaryContainer: '#54647a',
    // Tertiary (Emerald — healthy/success)
    tertiary: '#006242',
    onTertiary: '#ffffff',
    tertiaryContainer: '#007d55',
    // Error
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
  },
  typography: {
    displayLg: {
      fontFamily: sans,
      fontSize: '32px',
      lineHeight: '40px',
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },
    headlineMd: {
      fontFamily: sans,
      fontSize: '24px',
      lineHeight: '32px',
      letterSpacing: '-0.01em',
      fontWeight: 600,
    },
    headlineSm: {
      fontFamily: sans,
      fontSize: '18px',
      lineHeight: '24px',
      fontWeight: 600,
    },
    bodyLg: {
      fontFamily: sans,
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
    },
    bodyMd: {
      fontFamily: sans,
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
    },
    bodySm: {
      fontFamily: sans,
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: 400,
    },
    labelMd: {
      fontFamily: sans,
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.05em',
      fontWeight: 500,
    },
    codeSm: {
      fontFamily: mono,
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
  },
  spacing: {
    none: '0',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  fonts: { body: sans, mono, icon },
  fontSizes: { sm: '13px', md: '14px', lg: '16px' },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(27, 39, 51, 0.06)',
    md: '0 8px 16px rgba(27, 39, 51, 0.12)',
  },
  transitions: { fast: '120ms ease', base: '200ms ease' },
  sizes: {
    sidebar: '240px',
    maxContent: '1440px',
    inputHeight: '40px',
    inputHeightSm: '32px',
    avatar: '32px',
    iconButton: '32px',
  },
  breakpoints: { sm: 480, md: 768, lg: 1024 },
} as const;

export type Theme = typeof theme;
