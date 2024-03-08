import React from 'react';
import { Text, View, Pressable } from 'react-native';

const Creator = ({ navigation }) => {
  return (
    <>
      <View className="bg-white w-screen h-screen pt-20 px-8">
        <Text>CREATOR</Text>

        <Pressable onPress={() => navigation.navigate('Assistant')}>
          <Text>Go to Assistant</Text>
        </Pressable>
      </View>
    </>
  )
}

export default Creator;