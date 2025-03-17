// Import polyfills
import 'buffer';
import 'process/browser';
import 'stream-browserify';
import 'util';
import 'browserify-fs';

// Make them available globally
window.Buffer = window.Buffer || require('buffer').Buffer;
window.process = window.process || require('process/browser');
window.global = window.global || window;

// Export them for use in other modules
export { Buffer } from 'buffer';
export { default as process } from 'process/browser';
export { default as stream } from 'stream-browserify';
export { default as util } from 'util';
export { default as fs } from 'browserify-fs'; 