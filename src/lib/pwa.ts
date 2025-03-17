
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  } else {
    console.warn('Service workers are not supported in this browser');
  }
}

// Function to show update notification (simplified)
function showUpdateNotification() {
  console.log('New content is available; please refresh.');
}

// Check if the app can be installed (simplified)
export function checkInstallability() {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('App can be installed');
  });
}

// Export additional PWA utility functions
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

// Function to check if the browser supports PWA features
export function isPWASupported() {
  return 'serviceWorker' in navigator;
}
