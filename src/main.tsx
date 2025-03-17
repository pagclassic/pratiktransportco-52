
// Import polyfills first
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker, checkInstallability, isPWASupported } from './lib/pwa';

// Create root element first to prevent "Target container is not a DOM element" error
const rootElement = document.getElementById('root');

// Check if root element exists before rendering
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Register service worker for PWA functionality
  if (isPWASupported()) {
    console.log('PWA features are supported in this browser');
    registerServiceWorker()
      .then(() => console.log('Service worker registered successfully'))
      .catch(error => console.error('Service worker registration failed:', error));
    
    // Check if the app can be installed
    checkInstallability();
  } else {
    console.log('PWA features are not fully supported in this browser');
  }
} else {
  console.error('Root element not found in the DOM');
}
