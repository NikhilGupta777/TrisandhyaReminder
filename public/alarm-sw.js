// Service Worker for background alarm notifications
// This enables alarms to trigger even when the browser is minimized

self.addEventListener('install', (event) => {
  console.log('Alarm Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Alarm Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_ALARMS') {
    console.log('Checking alarms in background');
    // Future: implement periodic background sync for alarms
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'alarm-check') {
    event.waitUntil(checkAndTriggerAlarms());
  }
});

async function checkAndTriggerAlarms() {
  // This would check IndexedDB for due alarms
  // For now, we rely on the main app's interval checking
  console.log('Periodic alarm check');
}
