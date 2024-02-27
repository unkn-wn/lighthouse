import { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, FlatList, Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {db } from '../firebaseConfig.js';
import { doc, getDocs, collection } from 'firebase/firestore';

const Stack = createStackNavigator();

const ParkingInfoScreen = ({route, navigation}) => {

}

const ListScreen = ({navigation}) => {

  console.log("helloi");
  const getParkingData = async () => {
    console.log("inside")
    const querySnapshot = await getDocs(collection(db, "parking")).catch((error) => {
      console.log(error);
    });
    console.log("got_data");
    console.log(querySnapshot.docs);
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
          navigation.navigate('ParkingInfo', {
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
    <SafeAreaView classname="flex-1 h-screen bg-black">
      <FlatList

        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />  
    </SafeAreaView>
  )
}


const ListContainer = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="List" component={ListScreen} options={{headerShown: false}} />
            <Stack.Screen name="ParkingInfo" component={ParkingInfoScreen} />
        </Stack.Navigator>
    )
}

export default ListContainer;