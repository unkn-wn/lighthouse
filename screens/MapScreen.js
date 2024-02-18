import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Linking, AppState, Modal } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import * as Location from 'expo-location';


const MapScreen = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [locationRunning, setLocationRunning] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // This useEffect is for checking if app is focused or not
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        startLocation();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // This useEffect and startLocation() is for asking location permission and beginning location tracking
  useEffect(() => {
    (async () => {
      startLocation();
    })();
  }, []);

  const startLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setLocationRunning(false);
      setLocationText('Permission to access location was denied. Please open settings and allow location access.');
      setModalVisible(true);
      return;
    }

    if (!locationRunning) {
      setLocationRunning(true);
      const locationListener = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (loc) => {
          setLocationText(JSON.stringify(loc));
        }
      );

      return () => {
        if (locationListener) {
          locationListener.remove();
          setLocationRunning(false);
        }
      };
    }


  }



  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', width: '75%', padding: 20, borderRadius: 10 }}>
            <Text>Permission to access location was denied. Lighthouse requires your location to find the closest parking options near you. Open settings?</Text>
            {/* Ok and Cancel buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
              <Button title="No" onPress={() => setModalVisible(false)} />
              <Button title="Yes" onPress={() => { Linking.openSettings(); setModalVisible(false) }} />
            </View>
          </View>
        </View>
      </Modal>
      <Text>This is the Home Screen</Text>
      <Text>state: {appStateVisible}</Text>
      <Text>{locationText}</Text>
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