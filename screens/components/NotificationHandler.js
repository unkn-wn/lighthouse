import * as Notifications from 'expo-notifications';
import { useEffect, useState, createContext } from 'react';
import { Alert } from 'react-native';

export const NotificationContext = createContext();

export const useTriggerNotificationDate = () => {
  const [listeners, setListeners] = useState([]);

  const triggerNotificationDate = async (title, body, year, month, day, hours, minutes, seconds) => {
    let date = new Date(year, month - 1, day, hours, minutes, seconds);
    console.log("Sending notif:", title, "at", date.toString());
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { date: date },
    });

    const listener = Notifications.addNotificationResponseReceivedListener(notification => {
      Alert.alert(notification.notification.request.content.body);
    });

    setListeners(prevListeners => [...prevListeners, listener]);
  }

  useEffect(() => {
    return () => {
      listeners.forEach(listener => {
        Notifications.removeNotificationSubscription(listener);
      });
    };
  }, [listeners]);

  return triggerNotificationDate;
}

// Do the same for useTriggerNotificationTime

export const useTriggerNotificationTime = () => {
  const [listeners, setListeners] = useState([]);

  const triggerNotificationTime = async (title, body, hours, minutes, seconds) => {
    const raw = hours * 3600 + minutes * 60 + seconds;
    console.log("Sending notif:", title, "in", raw, "seconds");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { date: new Date(Date.now() + raw * 1000) },
    });

    const listener = Notifications.addNotificationResponseReceivedListener(notification => {
      Alert.alert(notification.notification.request.content.body);
    });

    setListeners(prevListeners => [...prevListeners, listener]);
  }

  useEffect(() => {
    return () => {
      listeners.forEach(listener => {
        Notifications.removeNotificationSubscription(listener);
      });
    };
  }, [listeners]);

  return triggerNotificationTime;
}