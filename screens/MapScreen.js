import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, Linking, AppState, Modal, Image } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
// https://github.com/react-native-maps/react-native-maps/blob/HEAD/docs/mapview.md
// https://www.npmjs.com/package/react-native-maps


const MapScreen = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [locationRunning, setLocationRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [wait, setWait] = useState(true);
  const [curIndex, setCurIndex] = useState(0);
  const [location, setLocation] = useState({ "coords": { "latitude": 40.426170, "longitude": -86.920284, "accuracy": 0, "altitude": 0, "heading": 0, "speed": 0, "altitudeAccuracy": 0 }, "timestamp": 0 });

  const initialMarkers = [
    {
      title: "Parking what a title amsdksmdksdjaaaaal",
      description: "Parking test description hi hello address and stuff wow look at this cool description length check length check length checklength check length checklength check length checklength check length checklength check length check",
      coordinate: {
        latitude: 40.430059,
        longitude: -86.924503,
      },
      image: require('../assets/marker.png'),
    },
    {
      title: "Russell Parking ",
      description: "On campus metered parking. 15 minute minimum starting at $0.65, $0.25 per additional 15 minutes",
      coordinate: {
        latitude: 40.431031,
        longitude: -86.919505,
      },
      image: require('../assets/marker.png'),
    },
  ]

  const [markers, setMarkers] = useState(initialMarkers);

  // Bottom Sheet variables and stuff
  const bottomSheetModalRef = useRef(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current.present();
  }, []);
  const handleSheetChanges = useCallback((index) => {
    // console.log('handleSheetChanges', index);
    if (index === -1) {
      bottomSheetModalRef.current.dismiss();
      setMarkers((prev) => {
        const newMarkers = [...prev];
        newMarkers[curIndex].image = require("../assets/marker.png")
        return newMarkers;
      });
    }

  }, []);


useEffect(() => {
  setTimeout(() => {
    setWait(false);
  }, 500);
}, []);

useEffect(() => {
  if (this.map) {
    this.map.animateToRegion({
      latitude: markers[curIndex].coordinate.latitude - 0.001,
      longitude: markers[curIndex].coordinate.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
  }
}, [curIndex]);


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
// END LOCATION STUFF


return (
  <BottomSheetModalProvider>
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

      {!wait && <MapView
        ref={(ref) => { this.map = ref; }}
        className="w-full h-full"
        provider='google' // 'google' for google maps
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsPointsOfInterest={false}
        showsCompass={true}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      // onMarkerPress={(e) => {
      //   console.log(e.nativeEvent);
      // }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => {
              handlePresentModalPress();
              setMarkers((prev) => {
                const newMarkers = [...prev];
                newMarkers[curIndex].image = require("../assets/marker.png")
                newMarkers[index].image = require("../assets/marker2.png")
                return newMarkers;
              });
              setCurIndex(index);
            }}
            pinColor={marker.color}
          >
            <Image source={markers[index].image} style={{ width: 40, height: 40 }} />
            <Callout tooltip={true} />
          </Marker>
        ))}

      </MapView>
      }
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={['15%']}
        enableDynamicSizing
        onChange={handleSheetChanges}
      >
        <BottomSheetView className="flex-1 bg-white w-full h-full p-6">
          <View className="p-4">
            <View className="flex-row">
              <View className="flex-col w-2/3">
                <Text className="text-3xl font-bold text-primary">{markers[curIndex].title}</Text>
                <Text className="text-sm font-light text-primary">0.4 miles from destination.</Text>
                <Text className="text-sm mt-1 font-semibold text-secondary">1234 Address street{"\n"}West Lafayette, Indiana 27482</Text>
              </View>
              <View className="flex-col gap-2 w-1/3 h-fit justify-center items-center">
                <Image className="w-16 h-16 border-2" />
                <Text className="text-xs text-gray-500 text-center">Requires "A Permit" to park.</Text>
              </View>
            </View>
            <Text className="mt-2 text-sm font-medium text-secondary">{markers[curIndex].description}</Text>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <StatusBar style="auto" />
    </View>
  </BottomSheetModalProvider>
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