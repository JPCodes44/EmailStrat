// Ambient declarations for non-code imports that Vite resolves at build time.

declare module '*.css';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
