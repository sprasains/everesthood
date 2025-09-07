# 📱 PWA (Progressive Web App) Guide

## Overview
This guide covers Progressive Web App implementation and best practices.

## Setup

### Manifest Configuration
```json
{
  "name": "EverestHood",
  "short_name": "EverestHood",
  "description": "A social network for the next generation",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```typescript
// public/sw.js
const CACHE_NAME = 'everesthood-cache-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/styles.css',
        '/main.js',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
```

### Registration
```typescript
// src/lib/pwa/register.ts
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
};

// pages/_app.tsx
useEffect(() => {
  registerServiceWorker();
}, []);
```

## Features

### Offline Support
```typescript
// pages/offline.tsx
export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>You're Offline</h1>
      <p>Please check your internet connection</p>
    </div>
  );
}

// Offline data storage
const storeDataOffline = async (key: string, data: any) => {
  if ('indexedDB' in window) {
    const db = await openDB('everesthood-db', 1);
    await db.put('offline-store', data, key);
  }
};

const getOfflineData = async (key: string) => {
  if ('indexedDB' in window) {
    const db = await openDB('everesthood-db', 1);
    return await db.get('offline-store', key);
  }
  return null;
};
```

### Push Notifications
```typescript
// src/lib/pwa/notifications.ts
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const subscribeToPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    const publicKey = await fetchPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });
  }
  
  return subscription;
};

// Service worker push handling
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: data.url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

### App Installation
```typescript
// src/lib/pwa/install.ts
export const listenForInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
};

export const promptInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
};

// components/InstallButton.tsx
const InstallButton = () => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    listenForInstallPrompt();
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setCanInstall(false);
    }
  };

  return canInstall ? (
    <button onClick={handleInstall}>
      Install App
    </button>
  ) : null;
};
```

### Background Sync
```typescript
// Register sync
const registerSync = async () => {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-posts');
};

// Service worker sync handling
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

const syncPosts = async () => {
  const db = await openDB('everesthood-db', 1);
  const posts = await db.getAll('offline-posts');
  
  for (const post of posts) {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      });
      await db.delete('offline-posts', post.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
};
```

### Workbox Integration
```typescript
// src/lib/pwa/workbox-config.js
module.exports = {
  globDirectory: 'public/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,svg,ico}',
  ],
  swDest: 'public/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.yourdomain\.com/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /^https:\/\/images\.yourdomain\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
  ],
};
```

## Testing

### Lighthouse PWA Audit
```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# CI integration
npx @lhci/cli autorun
```

### PWA Testing
```typescript
describe('PWA Features', () => {
  it('registers service worker', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    expect(registration).toBeTruthy();
  });

  it('shows offline page when offline', async () => {
    await page.setOfflineMode(true);
    await page.goto('/');
    expect(await page.content()).toContain('You\'re Offline');
  });

  it('caches static assets', async () => {
    const cache = await caches.open('everesthood-cache-v1');
    const keys = await cache.keys();
    expect(keys.length).toBeGreaterThan(0);
  });
});
```

## Best Practices

### DO
- Implement offline functionality
- Use service workers effectively
- Cache appropriate resources
- Provide install experience
- Handle push notifications
- Test PWA features
- Use background sync

### DON'T
- Cache sensitive data
- Ignore PWA audit scores
- Skip offline testing
- Forget to handle errors
- Cache everything
- Ignore update flow

## Resources
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)
