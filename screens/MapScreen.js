import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Linking } from 'react-native';
import { useEffect, useState } from 'react';

import * as Location from 'expo-location';


const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErr('Permission to access location was denied');
        console.log((await Location.getForegroundPermissionsAsync()).status);
        Linking.openSettings();
        return;
      }

      const locationListener = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (loc) => {
          setLocation(loc);
        }
      );

      return () => {
        if (locationListener) {
          locationListener.remove();
        }
      };
    })();
  }, []);



  let text = 'Waiting...';
  if (err) {
    text = err;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text>This is the Home Screen</Text>
      <Text>{text}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapScreen;