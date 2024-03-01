import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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

  const renderItem = ({ item }) => (
    <Pressable 
      onPress={() => navigation.navigate('Map', { itemName: item.name })}
      style={styles.item}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Parking Spots</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#999',
  },
  header: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#eb6363',
    paddingBottom: 20,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  item: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 2,
    padding: 16,
    shadowOpacity: 0.2,
    borderRadius: 4,
    // Additional styles to match your previous UI
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1, // for Android shadow
  },
  itemText: {
    fontSize: 18,
    color: '#4a4a4a',
  },
  listContentContainer: {
    flexGrow: 1,
    // If you want spacing around the FlatList or any specific styling
  },
});

export default ListContainer;
