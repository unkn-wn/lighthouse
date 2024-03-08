import React from 'react';
import { Text, View, Pressable } from 'react-native';

const Assistant = ({ navigation }) => {
  return (
    <>
      <View className="bg-white w-screen h-screen pt-20 px-8">
        <Text>ASSISTANt</Text>

        <Pressable onPress={() => navigation.navigate('Creator')}>
          <Text>Go to Creator</Text>
        </Pressable>
      </View>
    </>
  )
}

export default Assistant;