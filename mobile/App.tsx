import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { database } from './src/database/database';
import { alarmScheduler } from './src/services/alarmScheduler';

type RootStackParamList = {
  AlarmList: undefined;
  AddAlarm: undefined;
  EditAlarm: { alarmId: string };
  AlarmRing: { alarmId: string };
};

// Screens
import AlarmListScreen from './src/screens/AlarmListScreen';
import AddEditAlarmScreen from './src/screens/AddEditAlarmScreen';
import AlarmRingScreen from './src/screens/AlarmRingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await database.init();

      // Initialize alarm scheduler
      await alarmScheduler.initialize();

      // Reschedule all enabled alarms on app start
      await alarmScheduler.rescheduleAllAlarms();

      // Set up notification listeners
      setupNotificationListeners();

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data.alarmId) {
        // Navigate to alarm ring screen
        // This will be handled by deep linking in a full implementation
      }
    });

    // Handle notification received while app is foreground
    Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;

      if (data.alarmId) {
        // Trigger alarm ring screen
      }
    });
  };

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AlarmList"
        screenOptions={{
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="AlarmList"
          component={AlarmListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddAlarm"
          component={AddEditAlarmScreen}
          options={{ title: 'Add Alarm' }}
        />
        <Stack.Screen
          name="EditAlarm"
          component={AddEditAlarmScreen}
          options={{ title: 'Edit Alarm' }}
        />
        <Stack.Screen
          name="AlarmRing"
          component={AlarmRingScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
