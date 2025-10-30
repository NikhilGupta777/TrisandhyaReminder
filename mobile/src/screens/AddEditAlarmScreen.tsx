import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';
// @ts-ignore
import { Slider } from '@miblanchard/react-native-slider';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '../database/database';
import { alarmScheduler } from '../services/alarmScheduler';
import type { Alarm } from '../types/alarm';
import { WEEK_DAYS } from '../types/alarm';

interface Props {
  navigation: any;
  route: {
    params?: {
      alarmId?: string;
    };
  };
}

export default function AddEditAlarmScreen({ navigation, route }: Props) {
  const alarmId = route.params?.alarmId;
  const isEditing = !!alarmId;

  const [label, setLabel] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [toneName, setToneName] = useState('Default');
  const [toneUri, setToneUri] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [vibrate, setVibrate] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);

  useEffect(() => {
    if (isEditing) {
      loadAlarm();
    }
  }, [alarmId]);

  const loadAlarm = async () => {
    if (!alarmId) return;
    try {
      const alarm = await database.getAlarm(alarmId);
      if (alarm) {
        setLabel(alarm.label);
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const newTime = new Date();
        newTime.setHours(hours, minutes);
        setTime(newTime);
        setRepeatDays(alarm.repeatDays);
        setToneName(alarm.toneName);
        setToneUri(alarm.toneUri);
        setVolume(alarm.volume);
        setVibrate(alarm.vibrate);
        setSnoozeMinutes(alarm.snoozeMinutes);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load alarm');
    }
  };

  const toggleRepeatDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const pickCustomTone = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setToneUri(asset.uri);
        setToneName(asset.name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const saveAlarm = async () => {
    try {
      const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      
      const alarmData = {
        label: label || 'Alarm',
        time: timeString,
        enabled: true,
        repeatDays,
        toneName,
        toneUri,
        volume,
        vibrate,
        snoozeMinutes,
      };

      if (isEditing && alarmId) {
        await database.updateAlarm(alarmId, alarmData);
        const updatedAlarm = await database.getAlarm(alarmId);
        if (updatedAlarm) {
          await alarmScheduler.scheduleAlarm(updatedAlarm);
        }
      } else {
        const newAlarm = await database.createAlarm(alarmData);
        await alarmScheduler.scheduleAlarm(newAlarm);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save alarm');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Ionicons name="time-outline" size={24} color="#FF6B35" />
        </TouchableOpacity>
        
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={false}
            onChange={(event: any, selectedTime: any) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Alarm name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.daysContainer}>
          {WEEK_DAYS.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                repeatDays.includes(day.id) && styles.dayButtonActive,
              ]}
              onPress={() => toggleRepeatDay(day.id)}
            >
              <Text
                style={[
                  styles.dayText,
                  repeatDays.includes(day.id) && styles.dayTextActive,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {repeatDays.length === 0 && (
          <Text style={styles.hint}>No repeat - alarm will ring once</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Tone</Text>
        <View style={styles.toneRow}>
          <Text style={styles.toneText}>{toneName}</Text>
          <TouchableOpacity onPress={pickCustomTone}>
            <Ionicons name="musical-notes-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume: {volume}%</Text>
        <View style={styles.sliderContainer}>
          <Ionicons name="volume-low" size={20} color="#666" />
          <Slider
            minimumValue={0}
            maximumValue={100}
            value={volume}
            onValueChange={(value: any) => setVolume(Math.round(value))}
            minimumTrackTintColor="#FF6B35"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#FF6B35"
          />
          <Ionicons name="volume-high" size={20} color="#666" />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setVibrate(!vibrate)}
        >
          <Text style={styles.optionText}>Vibrate</Text>
          <Ionicons
            name={vibrate ? 'checkbox' : 'square-outline'}
            size={24}
            color="#FF6B35"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Snooze Duration</Text>
        <View style={styles.snoozeContainer}>
          {[5, 10, 15].map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.snoozeButton,
                snoozeMinutes === minutes && styles.snoozeButtonActive,
              ]}
              onPress={() => setSnoozeMinutes(minutes)}
            >
              <Text
                style={[
                  styles.snoozeText,
                  snoozeMinutes === minutes && styles.snoozeTextActive,
                ]}
              >
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveAlarm}>
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Update Alarm' : 'Create Alarm'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    fontSize: 18,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#FF6B35',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  toneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toneText: {
    fontSize: 16,
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  snoozeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  snoozeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  snoozeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  snoozeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  snoozeTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

