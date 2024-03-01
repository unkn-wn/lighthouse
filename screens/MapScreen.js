import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View, Button, Linking, AppState, Modal, Image } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import { db } from '../firebaseConfig.js';
import { doc, getDocs, collection } from 'firebase/firestore';
import { getParkingName } from './components/Parking.js';

import * as Location from 'expo-location';
import { Marker, Callout } from 'react-native-maps';
// https://github.com/react-native-maps/react-native-maps/blob/HEAD/docs/mapview.md
// https://www.npmjs.com/package/react-native-maps
import MapView from "react-native-map-clustering";
// https://github.com/venits/react-native-map-clustering


const MapScreen = ({ route, navigation }) => {

  useEffect(() => {
    if (route.params) {
      const { itemName } = route.params;
      var itemMarker;
      var itemIndex;
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].name.stringValue == itemName) {
          itemMarker = markers[i];
          itemIndex = i;
          console.log(itemMarker.name.stringValue);
          break;
        }
      }
      handleMarkerPress(itemMarker, itemIndex);
    }
  }, [route.params])

  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [locationRunning, setLocationRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [wait, setWait] = useState(true);
  const [curIndex, setCurIndex] = useState(0);
  const [location, setLocation] = useState({ "coords": { "latitude": 40.426170, "longitude": -86.920284, "accuracy": 0, "altitude": 0, "heading": 0, "speed": 0, "altitudeAccuracy": 0 }, "timestamp": 0 });


  const [markers, setMarkers] = useState([]);


  // Bottom Sheet variables and stuff
  const bottomSheetModalRef = useRef(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current.present();
    bottomSheetModalRef.current.expand();
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
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} opacity={0.1} enableTouchThrough={true} />,
    []
  );
  // END BOTTOM SHEET FUNCTIONS

  // UseEffect for getting parking data from firebase
  useEffect(() => {
    const getParkingData = async () => {
      const querySnapshot = await getDocs(collection(db, "parking")).catch((error) => {
        console.log(error);
      });
      const parkingData = [];
      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const temp = querySnapshot.docs[i]._document.data.value.mapValue.fields;
        temp.image = require("../assets/marker.png");
        parkingData.push(temp);
      }

      setMarkers(parkingData);
      // console.log(parkingData[0]);
    }
    getParkingData();
  }, []);

  // UseEffect for waiting for parking data to load
  useEffect(() => {
    if (markers.length > 0) {
      setWait(false);
    }
  }, [markers]);


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


  const handleMarkerPress = (marker, index) => {
    handlePresentModalPress();
    setCurIndex(index);
    mapRef.current.animateToRegion({
      latitude: marker.coords.geoPointValue.latitude - 0.001,
      longitude: marker.coords.geoPointValue.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
    setMarkers((prev) => {
      const newMarkers = [...prev];
      newMarkers.map((marker) => marker.image = require("../assets/marker.png"));
      newMarkers[index].image = require("../assets/marker2.png")
      return newMarkers;
    });
  }


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

        {!wait && locationRunning && <>
          <MapView
            ref={mapRef}
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
                coordinate={marker.coords.geoPointValue}
                title={marker.name.stringValue}
                description={marker.desc.stringValue}
                onPress={() => handleMarkerPress(marker, index)}
                pinColor={marker.color}
              >
                <Image source={markers[index].image} style={{ width: 40, height: 40 }} />
                <Callout tooltip={true} />
              </Marker>
            ))}

          </MapView>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={['15%']}
            enableDynamicSizing
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
          >
            <BottomSheetView className="flex-1 bg-white w-full h-full p-6">
              <View className="px-4 pb-6">
                <View className="flex-row">
                  <View className="flex-col w-2/3 items-left">
                    <Text className="text-2xl font-bold text-primary">{markers[curIndex].name.stringValue}</Text>
                    <Text className="text-sm font-light text-primary">{getParkingName(parseInt(markers[curIndex].parkingType.integerValue))}</Text>
                    <Text className="text-sm mt-1 font-semibold text-secondary">{markers[curIndex].address.stringValue}</Text>
                    <Pressable
                      onPress={() => {
                        const linkURL = "http://maps.apple.com/?daddr="
                          + markers[curIndex].coords.geoPointValue.latitude + ","
                          + markers[curIndex].coords.geoPointValue.longitude;
                        Linking.openURL(linkURL);
                      }}
                    >
                      <Text className="text-lg font-semibold text-blue-500">Open In Maps</Text>
                    </Pressable>
                  </View>
                  <View className="flex-col gap-2 w-1/3 h-fit justify-center items-center">

                      {/* <View className="w-16 h-16 rounded-full shadow-xl bg-primary justify-center items-center">
                        <Image className="w-10 h-10 -translate-x-0.5 translate-y-0.5" source={require("../assets/navigator.png")} />
                      </View> */}
                    <Text className="text-xs text-gray-500 text-center">Requires "A Permit" to park.</Text>
                  </View>
                </View>
                <Text className="mt-2 text-sm font-medium text-secondary">{markers[curIndex].desc.stringValue}</Text>
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </>
        }
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