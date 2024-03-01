import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as Location from 'expo-location';

const ListContainer = ({ navigation }) => {
  const [DATA, setDATA] = useState([]);

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
    } catch (error) {
      console.error(error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Placeholder function for distance calculation
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

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
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
