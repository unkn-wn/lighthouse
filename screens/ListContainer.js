import { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, FlatList, Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {db } from '../firebaseConfig.js';
import { doc, getDocs, collection } from 'firebase/firestore';

const Stack = createStackNavigator();

const ParkingInfoScreen = ({route, navigation}) => {

  const { item } = route.params;

  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 items-center mt-20">
        <Text>Name: {item.get('name')}</Text>
        <Text>Address: {item.get('address')}</Text>
        <Text>Allowed Permit: {item.get('restrictedPermit')}</Text>
      </View>
    </View>
  )

}

const ListScreen = ({navigation}) => {

  const getParkingData = async () => {
    const querySnapshot = await getDocs(collection(db, "parking")).catch((error) => {
      console.log(error);
    });
    //console.log(querySnapshot.docs);
    setDATA(querySnapshot.docs);
  }

  const Item = ({item, onPress}) => (
    <Pressable onPress={onPress}>
      <Text>{item.get('name')}</Text>
    </Pressable>
  );

  const renderItem = ({item}) => {
    return (
      <Item
        item={item}
        onPress={() => {
          navigation.navigate('Parking Information', {
            item: item,
          });
        }}
      />
    );
  }

  const [DATA, setDATA] = useState(null);
  useEffect(() => {
    getParkingData();
  }, [])

  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 items-center mt-20">
        <FlatList
          className="text-3xl"
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />  
      </View>
    </View>
  )
}


const ListContainer = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="List" component={ListScreen} options={{headerShown: false}} />
            <Stack.Screen name="Parking Information" component={ParkingInfoScreen} />
        </Stack.Navigator>
    )
}

export default ListContainer;