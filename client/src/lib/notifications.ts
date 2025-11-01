// Notification utilities for browser notifications and WebSocket

export type NotificationPermission = 'default' | 'granted' | 'denied';

// Request browser notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    // This browser does not support notifications
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  return Notification.permission as NotificationPermission;
}

// Show browser notification
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const { onClick, ...notificationOptions } = options || {};
  
  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    ...notificationOptions,
  });

  if (onClick) {
    notification.onclick = onClick;
  }

  return notification;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(userId: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    // Push notifications are not supported
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      // Note: In production, you'll need VAPID public key from your push service
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      if (!vapidKey) {
        throw new Error('VAPID public key not configured');
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    // Send subscription to server
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        },
      }),
    });

    return subscription;
  } catch (error) {
    // Failed to subscribe to push notifications - handle silently
    return null;
  }
}

// Helper functions for push subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// ⚠️ AWS AMPLIFY COMPATIBILITY NOTE:
// WebSocket connection is DISABLED for AWS Amplify Hosting deployment.
// AWS Amplify compute functions (serverless) do NOT support persistent WebSocket connections.
// 
// This class is now a no-op stub that gracefully handles the absence of WebSocket support.
// Notifications will still work through the REST API and will appear when users refresh
// or navigate between pages. For real-time notifications, integrate AWS AppSync or IoT Core.

export class NotificationWebSocket {
  private listeners: Set<(notification: any) => void> = new Set();
  private userId: string | null = null;

  // Stub connect method - does nothing on AWS Amplify
  connect(userId: string) {
    this.userId = userId;
    // WebSocket disabled for AWS Amplify serverless compatibility
    // Notifications will be fetched via REST API polling or on page refresh
    console.log('[NotificationWS] WebSocket disabled (AWS Amplify mode) - using REST API fallback');
  }

  // Stub disconnect method
  disconnect() {
    this.userId = null;
  }

  // Allow components to register listeners (no-op but prevents errors)
  onNotification(callback: (notification: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

/* ORIGINAL WebSocket CODE (for reference - use with non-Amplify deployments)
export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(notification: any) => void> = new Set();
  private userId: string | null = null;

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    this.userId = userId;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.ws?.send(JSON.stringify({ type: 'authenticate', userId: this.userId }));
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification') {
            this.listeners.forEach(listener => listener(data.notification));
            if (Notification.permission === 'granted') {
              showBrowserNotification(
                data.notification.notification.title,
                {
                  body: data.notification.notification.message,
                  icon: data.notification.notification.imageUrl || '/icon-192.png',
                  tag: data.notification.notification.id,
                  onClick: () => {
                    if (data.notification.notification.targetUrl) {
                      window.location.href = data.notification.notification.targetUrl;
                    }
                  },
                }
              );
            }
          }
        } catch (error) {}
      };
      this.ws.onclose = () => {
        this.ws = null;
        this.attemptReconnect();
      };
      this.ws.onerror = (error) => {};
    } catch (error) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, delay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  onNotification(callback: (notification: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}
*/

// Singleton instance
export const notificationWS = new NotificationWebSocket();
