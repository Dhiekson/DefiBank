
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = { env: {} } as any;

export default function setupPolyfills() {
  console.log('Polyfills initialized');
}
