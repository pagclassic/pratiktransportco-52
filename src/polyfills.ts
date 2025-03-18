
// Polyfills for browser environment
// Note: We're not directly importing Node.js modules in browser context

// Create browser-compatible versions of Node.js globals
window.Buffer = window.Buffer || { 
  from: (data: any) => data,
  alloc: (size: number) => new Uint8Array(size)
};

window.process = window.process || {
  env: {},
  browser: true,
  version: '',
  versions: {},
  platform: 'browser'
};

window.global = window.global || window;

// Console message to confirm polyfills are loaded
console.log('Browser-compatible polyfills loaded successfully');

export {};
