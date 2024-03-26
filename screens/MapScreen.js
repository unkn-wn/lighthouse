import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, Text, View, Button, Linking, AppState, Modal, Image, Keyboard } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { getAuth } from "firebase/auth";
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { getParkingName } from './components/Parking.js';
import SearchBar from '../screens/components/SearchBar';
import { PERMIT } from '../screens/components/Permit.js';
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
  const [distanceToSpot, setDistanceToSpot] = useState(null);


  // load in the current user's info
  const auth = getAuth();
  const user = auth.currentUser;
  var username;
  if (user != null) {
    username = user.displayName;
  }
  
  const [permit, setPermit] = useState(null);

  //const username = auth.currentUser.displayName;

  const loadUserData = async (username) => {
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists()) {
          if (doc.data().permitType != '') {
            setPermit(doc.data().permitType);
          }
        }
      })
      .catch((error) => {
        console.log('Error:', error);
        return;
      }
      );
  }

  const userPermitAppliesToLocation = (item) => {
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    let permitDetails = item.details.mapValue.fields;

    // get permit details for current day
    switch(day) {
      case 0:
        permitDetails = permitDetails.sunday;
        break;
      case 1:
        permitDetails = permitDetails.monday;
        break;
      case 2:
        permitDetails = permitDetails.tuesday;
        break;
      case 3:
        permitDetails = permitDetails.wednesday;
        break;
      case 4:
        permitDetails = permitDetails.thursday;
        break;
      case 5:
        permitDetails = permitDetails.friday;
        break;
      case 6:
        permitDetails = permitDetails.saturday;
        break;
      default:
        return false;
    }
    permitDetails = permitDetails.mapValue.fields

    if (!permitDetails.permit.arrayValue.values) {
      return false;
    }
      // check if current hour is within permit start and end time at location
    if ((permitDetails.startTime.integerValue == -1 && permitDetails.endTime.integerValue == -1)
    || (permitDetails.startTime.integerValue < hour && hour < permitDetails.endTime.integerValue)) {
      // permit hierarchy
      switch (permit) {
        case PERMIT.A:
          if (permitDetails.permit.arrayValue.values[0].stringValue == PERMIT.A) {
            return true;
          }
        case PERMIT.B:
          if (permitDetails.permit.arrayValue.values[0].stringValue == PERMIT.B) {
            return true;
          }
        case PERMIT.C:
          if (permitDetails.permit.arrayValue.values[0].stringValue == PERMIT.C) {
            return true;
          }
          break;
        case PERMIT.RES:
          if (permitDetails.permit.arrayValue.values[0].stringValue == PERMIT.RES) {
            return true;
          }
          break;
        default:
          return false;
      }
    }
    return false;
  }

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
        if (userPermitAppliesToLocation(newMarkers[curIndex])) {
          newMarkers[curIndex].image = require("../assets/marker3.png");
        }
        else {
          newMarkers[curIndex].image = require("../assets/marker.png");
        }
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
        if (userPermitAppliesToLocation(temp)) {
          temp.image = require("../assets/marker3.png");
        }
        else {
          temp.image = require("../assets/marker.png");
        }
        parkingData.push(temp);
      }

      setMarkers(parkingData);
      // console.log(parkingData[0]);
    }
    getParkingData();
  }, [permit]);

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return (d * 0.621371);
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  const handleMarkerPress = (marker, index) => {
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      marker.coords.geoPointValue.latitude,
      marker.coords.geoPointValue.longitude
    );
    setDistanceToSpot(distance.toFixed(2));

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
      newMarkers.map((marker) => marker.image = (userPermitAppliesToLocation(marker) ? require("../assets/marker3.png") : require("../assets/marker.png")));
      newMarkers[index].image = require("../assets/marker2.png")
      return newMarkers;
    });
  }

  const getPermitValue = (markers, curIndex) => {
    if (!markers || !markers[curIndex]) return 'Loading...';

    // Adjusted to navigate through mapValue.fields
    const details = markers[curIndex].details.mapValue.fields;
    if (!details || !details.friday) {
      return 'Details not available';
    }

    // Assuming friday and permit have similar structures
    const permit = details.friday.mapValue.fields.permit.arrayValue.values;
    if (!permit || permit.length === 0) return 'Permit not available';

    // Adjusted access based on Firestore structure for arrays
    const permitValue = permit[0].stringValue;
    if (!permitValue) return 'Permit value not available';

    return "Requires permit \"" + permitValue + "\" to park.";
  };

  const getDistanceFromMarker = (marker) => {
    return calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      marker.coords.geoPointValue.latitude,
      marker.coords.geoPointValue.longitude
    )
  }


  const updateParkingStatus = async (nearest_marker_name) => {
    await updateDoc(doc(db, "users", username), {
        parkingStatus: nearest_marker_name
      })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });
  }

  const findClosestParking = async () => {
    const distanceToMarkers = markers.map(getDistanceFromMarker);
    var lowest_distance = Number.MAX_SAFE_INTEGER;
    var lowest_distance_idx = 0;
    for (let i = 0; i < distanceToMarkers.length; i++) {
      if (distanceToMarkers[i] < lowest_distance) {
        lowest_distance = distanceToMarkers[i];
        lowest_distance_idx = i;
      }
    }
    const nearest_marker = markers[lowest_distance_idx];
    console.log(nearest_marker.name.stringValue);
    console.log(distanceToMarkers[lowest_distance_idx])
    
    // check setting for parking confirmation
    var confirmLocation;
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists() && !doc.data().confirmCorrectLocation) {
          confirmLocation = false;
        } else {
          confirmLocation = true;
        }
      });
    if (confirmLocation) {
      Alert.alert(
        'Are you parked here?',
        nearest_marker.name.stringValue,
        [
          {
            text: 'No',
            onPress: () => {
              console.log("not parked there");
            },
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              updateParkingStatus(nearest_marker.name.stringValue);
            }
          }
        ]
      )
    } else {
      updateParkingStatus(nearest_marker.name.stringValue);
    }

  }

  const sendParkingLocationAlert = () => {
    Alert.alert(
      'Use current location?',
      '',
      [
        {
          text: 'No',
          onPress: () => {
            console.log("No pressed");
          },
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {findClosestParking()}
        }
      ]
    );
  }

  loadUserData(username);

  return (
    <View style={{ flex: 1 }}>
      <SearchBar style={{ position: 'absolute', top: 20, left: 0, right: 0, zIndex: 1 }} />
      <Pressable
        onPress={() => sendParkingLocationAlert()}
        className="items-center bg-primary justify-start py-2 rounded-full absolute top-20 right-5 my-7 z-10"
      >
        <Text className="text-lg text-white px-2">Update Parking Location</Text>
      </Pressable>
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
                style={{ flex: 1 }}
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
                onPress={() => Keyboard.dismiss()}
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
                        {/* <Text className="text-sm font-light text-primary">{getParkingName(parseInt(markers[curIndex].parkingType.integerValue))}</Text> */}
                        <Text className="text-sm font-normal text-primary">Distance: {distanceToSpot} mi</Text>
                        <Text className="text-sm mt-1 font-semibold text-secondary">{markers[curIndex].address.stringValue}</Text>
                      </View>
                      <View className="flex-col gap-2 w-1/3 h-fit justify-center items-center">

                        {/* <View className="w-16 h-16 rounded-full shadow-xl bg-primary justify-center items-center">
                            <Image className="w-10 h-10 -translate-x-0.5 translate-y-0.5" source={require("../assets/navigator.png")} />
                          </View> */}
                        <Pressable
                          onPress={() => {
                            const linkURL = "http://maps.apple.com/?daddr="
                              + markers[curIndex].coords.geoPointValue.latitude + ","
                              + markers[curIndex].coords.geoPointValue.longitude;
                            Linking.openURL(linkURL);
                          }}
                        >
                          <Text className="text-base font-semibold text-blue-500 text-center">Open In Maps</Text>
                        </Pressable>
                        <Text className="text-xs text-gray-500 text-center">{getPermitValue(markers, curIndex)}</Text>
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