// Notification utilities for browser notifications and WebSocket

export type NotificationPermission = 'default' | 'granted' | 'denied';

// Request browser notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
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
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      // Note: In production, you'll need VAPID public key from your push service
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder - you'll need to generate VAPID keys
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
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
    console.error('Failed to subscribe to push notifications:', error);
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

// WebSocket connection manager for real-time notifications
export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(notification: any) => void> = new Set();
  private userId: string | null = null;

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.userId = userId;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[NotificationWS] Connected');
        this.reconnectAttempts = 0;
        
        // Authenticate
        this.ws?.send(JSON.stringify({
          type: 'authenticate',
          userId: this.userId,
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_notification') {
            // Notify all listeners
            this.listeners.forEach(listener => listener(data.notification));
            
            // Show browser notification if permission granted
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
        } catch (error) {
          console.error('[NotificationWS] Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[NotificationWS] Disconnected');
        this.ws = null;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[NotificationWS] Error:', error);
      };
    } catch (error) {
      console.error('[NotificationWS] Connection error:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[NotificationWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
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

// Singleton instance
export const notificationWS = new NotificationWebSocket();
