import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '../database/database';
import { alarmScheduler } from '../services/alarmScheduler';
import type { Alarm } from '../types/alarm';
import { WEEK_DAYS } from '../types/alarm';

interface Props {
  navigation: any;
}

export default function AlarmListScreen({ navigation }: Props) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const loadAlarms = async () => {
    try {
      const allAlarms = await database.getAllAlarms();
      setAlarms(allAlarms);
    } catch (error) {
      console.error('Failed to load alarms:', error);
      Alert.alert('Error', 'Failed to load alarms');
    }
  };

  const toggleAlarm = async (alarm: Alarm) => {
    try {
      const newEnabled = !alarm.enabled;
      await database.updateAlarm(alarm.id, { enabled: newEnabled });
      
      if (newEnabled) {
        await alarmScheduler.scheduleAlarm({ ...alarm, enabled: true });
      } else {
        await alarmScheduler.cancelAlarm(alarm.id);
      }
      
      await loadAlarms();
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
      Alert.alert('Error', 'Failed to update alarm');
    }
  };

  const deleteAlarm = async (alarmId: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await alarmScheduler.cancelAlarm(alarmId);
              await database.deleteAlarm(alarmId);
              await loadAlarms();
            } catch (error) {
              console.error('Failed to delete alarm:', error);
              Alert.alert('Error', 'Failed to delete alarm');
            }
          },
        },
      ]
    );
  };

  const formatRepeatDays = (repeatDays: number[]) => {
    if (repeatDays.length === 0) return 'Once';
    if (repeatDays.length === 7) return 'Every day';
    
    const sortedDays = [...repeatDays].sort();
    return sortedDays.map(day => WEEK_DAYS[day].label).join(', ');
  };

  const renderAlarmItem = ({ item }: { item: Alarm }) => (
    <View style={styles.alarmItem}>
      <TouchableOpacity
        style={styles.alarmContent}
        onPress={() => navigation.navigate('EditAlarm', { alarmId: item.id })}
      >
        <View style={styles.alarmInfo}>
          <Text style={[styles.alarmTime, !item.enabled && styles.disabledText]}>
            {item.time}
          </Text>
          <Text style={[styles.alarmLabel, !item.enabled && styles.disabledText]}>
            {item.label || 'Alarm'}
          </Text>
          <Text style={[styles.alarmRepeat, !item.enabled && styles.disabledText]}>
            {formatRepeatDays(item.repeatDays)}
          </Text>
        </View>
        
        <View style={styles.alarmActions}>
          <Switch
            value={item.enabled}
            onValueChange={() => toggleAlarm(item)}
            trackColor={{ false: '#ccc', true: '#FF6B35' }}
            thumbColor={item.enabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAlarm(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAlarm')}
        >
          <Ionicons name="add" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alarm-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No alarms set</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first alarm</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          renderItem={renderAlarmItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadAlarms();
            setRefreshing(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  alarmItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alarmContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alarmLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  alarmRepeat: {
    fontSize: 14,
    color: '#999',
  },
  disabledText: {
    color: '#ccc',
  },
  alarmActions: {
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
  },
});
