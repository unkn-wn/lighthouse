import * as Notifications from 'expo-notifications';
import { useEffect, createContext } from 'react';
import { Alert } from 'react-native';

export const NotificationContext = createContext();

export const useTriggerNotifications = () => {
  const triggerNotifications = async (title, body, hours = 0, minutes = 0, seconds = 0) => {
    console.log("Sending notif: ", title);
    const raw = hours * 60 * 60 + minutes * 60 + seconds;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: raw },
    });
  }

  useEffect(() => {
    Notifications.addNotificationResponseReceivedListener(notification => {
      Alert.alert(notification.notification.request.content.body);
    });

    return () => {
      Notifications.removeAllNotificationListeners();
    };
  }, []);

  return triggerNotifications;
}