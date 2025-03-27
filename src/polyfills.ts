
// Polyfills for WalletConnect and other libraries that expect Node.js globals
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = { env: {} };

export default function setupPolyfills() {
  console.log('Polyfills initialized');
}
