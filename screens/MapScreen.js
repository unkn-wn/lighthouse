import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import io from 'socket.io-client';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [err, setErr] = useState(null);
  const [stock, setStock] = useState(null); // State to store fetched stock data

  useEffect(() => {
    // Request location permission and set up location listener
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

  useEffect(() => {
    // Fetch stock information from your server
    const fetchStockInfo = async () => {
      try {
        // change the IP to your IP
        const response = await fetch('http://100.69.8.31:3000/stock/CRNB');
        const data = await response.json();
        setStock(data); // Set the fetched stock data into state
      } catch (error) {
        console.error('Failed to fetch stock data:', process.env.REACT_APP_SERVER_IP, error);
      }
    };

    fetchStockInfo();
  }, []); // This effect runs only once on component mount

  let locationText = 'Waiting...';
  if (err) {
    locationText = err;
  } else if (location) {
    locationText = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text>This is the Home Screen</Text>
      <Text>Location: {locationText}</Text>
      {stock ? (
        <Text>Stock: {stock.name} - ${stock.price} ({stock.category})</Text>
      ) : (
        <Text>Loading stock information...</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapScreen;
