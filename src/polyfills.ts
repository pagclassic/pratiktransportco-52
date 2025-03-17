
// Import polyfills
import 'buffer';
import 'process/browser';

// Make them available globally
window.Buffer = window.Buffer || require('buffer').Buffer;
window.process = window.process || require('process/browser');
window.global = window.global || window;

// Export them for use in other modules
export { Buffer } from 'buffer';
export { default as process } from 'process/browser';

// Console message to confirm polyfills are loaded
console.log('Polyfills loaded successfully');
