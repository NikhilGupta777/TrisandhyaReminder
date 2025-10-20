import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alarmScheduler } from '../services/alarmScheduler';

interface Props {
  route: any;
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function AlarmRingScreen({ route, navigation }: Props) {
  const { alarmId, label, toneUri, toneName, volume, vibrate, snoozeMinutes } = route.params;
  
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Start playing alarm sound
    alarmScheduler.playAlarmSound(toneUri, volume, vibrate);

    // Start pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handleDismiss = async () => {
    await alarmScheduler.stopAlarmSound();
    navigation.goBack();
  };

  const handleSnooze = async () => {
    await alarmScheduler.stopAlarmSound();
    await alarmScheduler.snoozeAlarm(alarmId, snoozeMinutes);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="alarm" size={120} color="#fff" />
        </Animated.View>

        <Text style={styles.label}>{label || 'Alarm'}</Text>
        <Text style={styles.toneName}>{toneName}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.snoozeButton]}
          onPress={handleSnooze}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={32} color="#FF6B35" />
          <Text style={styles.snoozeText}>Snooze {snoozeMinutes} min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={handleDismiss}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={32} color="#fff" />
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    alignItems: 'center',
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -2,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  toneName: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  snoozeButton: {
    backgroundColor: '#fff',
  },
  snoozeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
  },
  dismissButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  dismissText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});
