import { useState, useEffect } from 'react';
import { Button, SafeAreaView, Text, View, FlatList, Pressable, Linking } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {db } from '../firebaseConfig.js';
import { doc, getDocs, collection } from 'firebase/firestore';

//const Stack = createStackNavigator();
//
//const ParkingInfoScreen = ({route, navigation}) => {
//
//  const { item } = route.params;
//
//  return (
//    <View className="flex-1 h-screen bg-white">
//      <View className="flex-1 items-center mt-20">
//        <Text>Name: {item.get('name')}</Text>
//        <Text>Address: {item.get('address')}</Text>
//        <Text>Allowed Permit: {item.get('restrictedPermit')}</Text>
//        <Button
//          title="Open in Maps"
//          onPress={() => {
//            const linkURL = "http://maps.apple.com/?daddr="
//                            + item.get('coords').latitude + ","
//                            + item.get('coords').longitude;
//            Linking.openURL(linkURL);
//          }}
//        />
//      </View>
//    </View>
//  )
//
//}

const ListContainer = ({navigation}) => {

  const getParkingData = async () => {
    const querySnapshot = await getDocs(collection(db, "parking")).catch((error) => {
      console.log(error);
    });
    //console.log(querySnapshot.docs);
    setDATA(querySnapshot.docs);
  }

  const Item = ({item, onPress}) => (
    <Pressable onPress={onPress} className="bg-white mx-8 my-2 py-4 shadow-md rounded-md">
      <Text className="text-lg text-gray-800 mx-8">{item.get('name')}</Text>
    </Pressable>
  );

  const renderItem = ({item}) => {
    return (
      <Item
        item={item}
        onPress={() => {
          navigation.navigate('Map', {
            itemName: item.get('name'),
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
  )
}


//const ListContainer = () => {
//    return (
//        <Stack.Navigator>
//            <Stack.Screen name="List" component={ListScreen} options={{headerShown: false}} />
//            <Stack.Screen name="Parking Information" component={ParkingInfoScreen} />
//        </Stack.Navigator>
//    )
//}

export default ListContainer;