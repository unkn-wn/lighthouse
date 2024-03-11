import { useState, useEffect } from 'react';
import { Button, SafeAreaView, Text, View, FlatList, Pressable, Linking } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchBar from '../screens/components/SearchBar';
import {db } from '../firebaseConfig.js';
import { doc, getDocs, collection } from 'firebase/firestore';
import * as Location from 'expo-location';

const ListContainer = ({ navigation }) => {
  const [DATA, setDATA] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
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

  const Item = ({item, onPress}) => (
    <Pressable onPress={onPress} className="bg-white mx-8 my-2 py-4 shadow-md rounded-md">
      <Text className="text-lg text-gray-800 mx-8">{item.name}</Text>
    </Pressable>
  );

  function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  const renderItem = ({item}) => {
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

  return (
    <View style={{ flex: 1 }}>
      <SearchBar style={{ position: 'absolute', top: 20, left: 0, right: 0, zIndex: 1 }} />
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
    </View>
  )
}

export default ListContainer;
