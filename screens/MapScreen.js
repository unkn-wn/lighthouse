import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, Linking, AppState, Modal } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import * as Location from 'expo-location';
import MapView from 'react-native-maps';


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
    <View className="flex-1 bg-white items-center justify-center">
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-5/6 p-4 rounded-lg">
            <Text>Permission to access location was denied. Lighthouse requires your location to find the closest parking options near you. Open settings?</Text>
            {/* Ok and Cancel buttons */}
            <View className="flex-row justify-around mt-2">
              <Button title="No" onPress={() => setModalVisible(false)} />
              <Button title="Yes" onPress={() => { Linking.openSettings(); setModalVisible(false) }} />
            </View>
          </View>
        </View>
      </Modal>

      <MapView
        className="w-full h-full"
        provider=''
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: 40.426170,
          longitude: -86.920284,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

export default MapScreen;