import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationWS, requestNotificationPermission, subscribeToPushNotifications } from '@/lib/notifications';

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Connect to WebSocket for real-time notifications
  useEffect(() => {
    if (!userId) return;

    notificationWS.connect(userId);

    const unsubscribe = notificationWS.onNotification((notification) => {
      // Invalidate queries to refresh notification list and count
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    });

    return () => {
      unsubscribe();
      notificationWS.disconnect();
    };
  }, [userId, queryClient]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    
    // If granted, subscribe to push notifications
    if (result === 'granted' && userId) {
      await subscribeToPushNotifications(userId);
    }
    
    return result;
  }, [userId]);

  // Subscribe to push notifications
  const enablePushNotifications = useCallback(async () => {
    if (permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        return false;
      }
    }

    if (userId) {
      const subscription = await subscribeToPushNotifications(userId);
      return subscription !== null;
    }

    return false;
  }, [userId, permission, requestPermission]);

  return {
    permission,
    requestPermission,
    enablePushNotifications,
  };
}

// Hook for notification sound playback
export function useNotificationSound() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playNotificationSound = useCallback((soundUrl?: string) => {
    try {
      // Default notification sound or custom sound
      const sound = soundUrl || '/notification.mp3';
      
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const newAudio = new Audio(sound);
      newAudio.volume = 0.5;
      newAudio.play().catch(err => {
        console.warn('Failed to play notification sound:', err);
      });
      
      setAudio(newAudio);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [audio]);

  return { playNotificationSound };
}
