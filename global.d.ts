// Allows TypeScript / VS Code to resolve plain CSS side-effect imports
// e.g. import './globals.css' in app/layout.tsx
// Next.js's bundled types cover *.module.css but not plain *.css imports.
declare module '*.css';
