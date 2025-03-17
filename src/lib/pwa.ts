
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show notification to user
                showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
        
      // Handle updates when the user returns to the app
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        }
      });
    });
  } else {
    console.warn('Service workers are not supported in this browser');
  }
}

// Function to show update notification
function showUpdateNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="pwa-update-content">
      <img src="/icons/icon-192x192.png" alt="Pratik Transport" width="40" height="40" />
      <div class="pwa-update-message">
        <strong>Update Available</strong>
        <p>A new version of Pratik Transport Portal is available.</p>
      </div>
      <button id="pwa-update-button">Update Now</button>
      <button id="pwa-update-close">✕</button>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .pwa-update-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 320px;
      overflow: hidden;
      animation: slide-in 0.3s ease-out;
    }
    
    .pwa-update-content {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
    }
    
    .pwa-update-message {
      flex: 1;
    }
    
    .pwa-update-message p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }
    
    #pwa-update-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    #pwa-update-close {
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 16px;
      padding: 0 4px;
    }
    
    @keyframes slide-in {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  
  // Add to DOM
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Add event listeners
  document.getElementById('pwa-update-button')?.addEventListener('click', () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  });
  
  document.getElementById('pwa-update-close')?.addEventListener('click', () => {
    notification.remove();
    style.remove();
  });
}

// Check if the app can be installed
export function checkInstallability() {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    showInstallButton(deferredPrompt);
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Hide the install button
    hideInstallButton();
    // Clear the deferredPrompt
    deferredPrompt = null;
  });
}

// Function to show install button
function showInstallButton(deferredPrompt: any) {
  // Create install button element
  const installButton = document.createElement('div');
  installButton.className = 'pwa-install-button';
  installButton.innerHTML = `
    <div class="pwa-install-content">
      <img src="/icons/icon-192x192.png" alt="Pratik Transport" width="40" height="40" />
      <div class="pwa-install-message">
        <strong>Install App</strong>
        <p>Add Pratik Transport Portal to your home screen</p>
      </div>
      <button id="pwa-install-action">Install</button>
      <button id="pwa-install-close">✕</button>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .pwa-install-button {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 320px;
      overflow: hidden;
      animation: slide-in 0.3s ease-out;
    }
    
    .pwa-install-content {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
    }
    
    .pwa-install-message {
      flex: 1;
    }
    
    .pwa-install-message p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }
    
    #pwa-install-action {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    #pwa-install-close {
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 16px;
      padding: 0 4px;
    }
  `;
  
  // Add to DOM
  document.head.appendChild(style);
  document.body.appendChild(installButton);
  
  // Add event listeners
  document.getElementById('pwa-install-action')?.addEventListener('click', async () => {
    // Hide the install button
    installButton.remove();
    style.remove();
    
    // Show the prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
    }
  });
  
  document.getElementById('pwa-install-close')?.addEventListener('click', () => {
    installButton.remove();
    style.remove();
  });
}

// Function to hide install button
function hideInstallButton() {
  const installButton = document.querySelector('.pwa-install-button');
  if (installButton) {
    installButton.remove();
  }
}

// Export additional PWA utility functions
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

// Function to check if the browser supports PWA features
export function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
