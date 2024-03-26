import { useState, useEffect } from 'react';
import { Button, SafeAreaView, Text, View, FlatList, Pressable, Linking, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchBar from '../screens/components/SearchBar';
import { db } from '../firebaseConfig.js';
import * as Location from 'expo-location';
import { getAuth } from "firebase/auth";
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { PERMIT } from '../screens/components/Permit.js';

const ListContainer = ({ navigation }) => {
  const [DATA, setDATA] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permit, setPermit] = useState(null);

  const auth = getAuth();
  const username = auth.currentUser.displayName;

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

  const userPermitAppliesToLocation = (item) => { // NOTE: CONSIDER REFRESHING PAGE IF USER CHANGES PERMIT??
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    let permitDetails = item.details;

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

    // check if current hour is within permit start and end time at location
    if ((permitDetails.startTime == -1 && permitDetails.endTime == -1) || (permitDetails.startTime < hour && hour < permitDetails.endTime)) {
      // permit hierarchy
      switch (permit) {
        case PERMIT.A:
          if (permitDetails.permit[0] == PERMIT.A) {
            return true;
          }
        case PERMIT.B:
          if (permitDetails.permit[0] == PERMIT.B) {
            return true;
          }
        case PERMIT.C:
          if (permitDetails.permit[0] == PERMIT.C) {
            return true;
          }
          break;
        case PERMIT.RES:
          if (permitDetails.permit[0] == PERMIT.RES) {
            return true;
          }
          break;
        default:
          return false;
      }
    }
    return false;
  }

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getLastKnownPositionAsync({ maxAge: 60000 });

      if (location == null) {
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        } catch (error) {
          console.error("Error getting current position", error);
        }
      }

      getParkingData(location);
    })();
  }, []);

  const getParkingData = async (userLocation) => {
    try {
      const querySnapshot = await getDocs(collection(db, "parking"));
      const docs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      const sortedData = docs.map(doc => ({
        ...doc,
        distance: calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          doc.coords.latitude,
          doc.coords.longitude
        )
      })).sort((a, b) => a.distance - b.distance);

      setDATA(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const Item = ({ item, onPress }) => {
    if (userPermitAppliesToLocation(item)) {
      return (
        <Pressable onPress={onPress} className="bg-yellow-200 mx-8 my-2 py-4 shadow-md rounded-md">
          <Text className="text-lg text-gray-800 mx-8">{item.name}</Text>
        </Pressable>
      );
    }
    else {
      return (
        <Pressable onPress={onPress} className="bg-white mx-8 my-2 py-4 shadow-md rounded-md">
          <Text className="text-lg text-gray-800 mx-8">{item.name}</Text>
        </Pressable>
      );
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
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
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        onPress={() => {
          navigation.navigate('Map', {
            itemName: item.name,
          });
        }}
      />
    );
  }

  loadUserData(username);

  return (
    <View style={{ flex: 1 }}>
      <SearchBar style={{ position: 'absolute', top: 20, left: 0, right: 0, zIndex: 1 }} />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fe575f" />
        </View>
      ) : (
        <View className="flex-1 h-screen bg-white">
          <View className="flex-1 max-h-40 items-center bg-primary">
            <Text className="text-white font-bold text-3xl mt-10 pt-5">Parking Spots</Text>
          </View>
          <View className="flex-1 items-center -mt-10">
            <FlatList
              className="w-full divide-y divide-solid divide-black"
              data={DATA}
              renderItem={renderItem}
              itemSeparatorComponent={<View className="h-0.5 bg-black" />}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      )}
    </View>
  )
}

export default ListContainer;
