
export function registerServiceWorker() {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful:', registration.scope);
            resolve(registration);
          })
          .catch(error => {
            console.error('ServiceWorker registration failed:', error);
            reject(error);
          });
      });
    } else {
      console.warn('Service workers are not supported in this browser');
      reject(new Error('Service workers not supported'));
    }
  });
}

// Function to show update notification
export function showUpdateNotification() {
  console.log('New content is available; please refresh.');
  // You can implement a more user-friendly notification here
}

// Check if the app can be installed
export function checkInstallability() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('App can be installed');
    
    // You can show your install button or UI element here
    // const installBtn = document.getElementById('installBtn');
    // if (installBtn) installBtn.style.display = 'block';
  });
  
  // You can later use deferredPrompt to show the install prompt
  // Example: installBtn.addEventListener('click', () => {
  //   deferredPrompt.prompt();
  //   deferredPrompt.userChoice.then((choiceResult) => {
  //     if (choiceResult.outcome === 'accepted') {
  //       console.log('User accepted the install prompt');
  //     } else {
  //       console.log('User dismissed the install prompt');
  //     }
  //     deferredPrompt = null;
  //   });
  // });
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
