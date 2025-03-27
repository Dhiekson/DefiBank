
// Polyfills for WalletConnect and other libraries that expect Node.js globals
import { Buffer } from 'buffer';

// Define a minimal process type for browser environment
declare global {
  interface Window {
    process: any;
    global: any;
    Buffer: typeof Buffer;
  }
}

window.global = window;
window.Buffer = Buffer;
// Use 'any' type to bypass TypeScript's strict checking for the process object
// We only need a minimal process object with env for compatibility
window.process = { env: {} } as any;

export default function setupPolyfills() {
  console.log('Polyfills initialized');
}
