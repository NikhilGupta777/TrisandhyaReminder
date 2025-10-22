// Service Worker for background alarm notifications
// This enables alarms to trigger even when the browser is minimized

const CACHE_NAME = 'trisandhya-alarms-v1';

self.addEventListener('install', (event) => {
  console.log('Alarm Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Alarm Service Worker activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const alarmId = event.notification.data?.alarmId;
  const action = event.action;
  
  // Handle snooze or dismiss actions
  if (action === 'dismiss' && alarmId) {
    // Send message to clients to dismiss alarm
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DISMISS_ALARM',
          alarmId: alarmId
        });
      });
    });
  } else if (action === 'snooze' && alarmId) {
    // Send message to clients to snooze alarm
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SNOOZE_ALARM',
          alarmId: alarmId
        });
      });
    });
  }
  
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
        return self.clients.openWindow('/alarms-new');
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_ALARMS') {
    console.log('Checking alarms in background via message');
    checkAndTriggerAlarms();
  } else if (event.data && event.data.type === 'TRIGGER_ALARM') {
    const { alarm } = event.data;
    showAlarmNotification(alarm);
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'alarm-check') {
    event.waitUntil(checkAndTriggerAlarms());
  }
});

async function checkAndTriggerAlarms() {
  try {
    // Open IndexedDB to check for due alarms
    const db = await openIndexedDB();
    const transaction = db.transaction(['alarms'], 'readonly');
    const store = transaction.objectStore('alarms');
    const alarms = await getAllFromStore(store);
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay();
    
    for (const alarm of alarms) {
      if (alarm.enabled && alarm.time === currentTime) {
        if (alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay)) {
          await showAlarmNotification(alarm);
        }
      }
    }
  } catch (error) {
    console.error('Failed to check alarms in service worker:', error);
  }
}

async function showAlarmNotification(alarm) {
  const options = {
    body: `Time: ${alarm.time}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: `alarm-${alarm.id}`,
    requireInteraction: true,
    vibrate: alarm.vibrate ? [500, 250, 500, 250, 500] : [],
    data: { alarmId: alarm.id },
    actions: [
      { action: 'dismiss', title: 'Dismiss' },
      { action: 'snooze', title: `Snooze ${alarm.snoozeMinutes}m` }
    ]
  };
  
  await self.registration.showNotification(alarm.label || 'Alarm', options);
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TrisandhyaAlarms', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
