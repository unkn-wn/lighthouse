import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, Linking, AppState, Modal } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
// https://github.com/react-native-maps/react-native-maps/blob/HEAD/docs/mapview.md
// https://www.npmjs.com/package/react-native-maps


const MapScreen = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [locationRunning, setLocationRunning] = useState(false);
  const [location, setLocation] = useState({ "coords": { "latitude": 40.426170, "longitude": -86.920284, "accuracy": 0, "altitude": 0, "heading": 0, "speed": 0, "altitudeAccuracy": 0 }, "timestamp": 0 });
  const [modalVisible, setModalVisible] = useState(false);

  // This useEffect is for checking if app is focused or not
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (!locationRunning) {
          startLocation();
        }
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
      // setLocation({});
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
          setLocation(loc);
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
        provider='google' // 'google' for google maps
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
        onMarkerPress={(e) => {
          console.log(e.nativeEvent);
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          description="This is your current location"
        >

        </Marker>
      </MapView>
      <StatusBar style="auto" />
    </View>
  );
}

// function DetailedMarker({ point, onToggle }) {
//   const { coordinates, title, description, showDetails } = point;

//   return (
//     <TouchableOpacity onPress={onToggle} className="flex-1 bottom-0 w-full h-1/3 bg-red-500">
//       <Marker coordinate={coordinates} />
//       {showDetails && <View><Text>{title} {description}</Text></View>}
//     </TouchableOpacity>
//   )
// }

export default MapScreen;