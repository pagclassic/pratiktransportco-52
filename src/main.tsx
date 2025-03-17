
// Import polyfills first
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker, checkInstallability, isPWASupported } from './lib/pwa';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
if (isPWASupported()) {
  console.log('PWA features are supported in this browser');
  registerServiceWorker();
  // Check if the app can be installed
  checkInstallability();
} else {
  console.log('PWA features are not fully supported in this browser');
}
