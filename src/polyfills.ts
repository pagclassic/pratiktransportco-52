
// Polyfills for browser environment
// Note: We're not directly importing Node.js modules in browser context

// Create browser-compatible versions of Node.js globals
if (typeof window !== 'undefined') {
  // Use type assertion to make TypeScript happy
  // @ts-ignore - intentionally creating a simplified Buffer polyfill
  window.Buffer = window.Buffer || {
    from: (data: any) => data,
    alloc: (size: number) => new Uint8Array(size)
  };

  // Use type assertion to make TypeScript happy
  // @ts-ignore - intentionally creating a simplified process polyfill
  window.process = window.process || {
    env: {},
    version: '',
    versions: {},
    platform: 'browser'
  };

  window.global = window.global || window;
}

// Console message to confirm polyfills are loaded
console.log('Browser-compatible polyfills loaded successfully');

export {};
