
import { Buffer } from 'buffer';

// Define a minimal process type for browser environment
declare global {
  interface Window {
    process: any;
    global: any;
    Buffer: typeof Buffer;
  }
}

// Ensure Buffer is available globally
window.global = window;
window.Buffer = Buffer;
// Use 'any' type to bypass TypeScript's strict checking for the process object
window.process = { env: {} } as any;

export default function setupPolyfills() {
  console.log('Polyfills initialized');
}
