import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Textbox from './components/Textbox.js'

const Stack = createStackNavigator();
const checkPasswords = (currentPass, newPass, reEnter) => {
  // check if the currentPass = the user's password

  // check if the new passwords match
  if (newPass != reEnter) {
    Alert.alert("Passwords don't match!");
    return;
  }

  Alert.alert('Passwords Entered!');
}

const EditPasswordScreen = ({navigation}) => {

  const [currentPassword, onChangeCur] = React.useState('');
  const [newPassword, onChangeNew] = React.useState('');
  const [reEnterPassword, onChangeRe] = React.useState('');

  // NOTE: disabled function for the button causes delay when entering text input
  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 items-center mt-20">
        <Textbox
          state={currentPassword}
          setState={onChangeCur}
          placeholder="Enter current password"
          secureTextEntry={false}
        />
        <Textbox
          state={newPassword}
          setState={onChangeNew}
          placeholder="Enter new password"
          secureTextEntry={false}
        />
        <Textbox
          state={reEnterPassword}
          setState={onChangeRe}
          placeholder="Re-enter new password"
          secureTextEntry={false}
        />
        <Pressable
          className={!Boolean(currentPassword && newPassword && reEnterPassword) ?
                      "bg-disabled w-1/2 rounded-xl py-5 mt-3" : "bg-primary w-1/2 rounded-xl py-5 mt-3"}
          disabled={!Boolean(currentPassword && newPassword && reEnterPassword)}
          onPress={() => checkPasswords(currentPassword, newPassword, reEnterPassword)}
        >
          <Text className="text-white font-bold text-center text-lg">DONE</Text>
        </Pressable>
      </View>
    </View>
  )
}

const ProfileScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>These are your account details!</Text>
      <Button
        title="Change Password"
        onPress = {() =>
          navigation.navigate('Change Password')
        }
      />
    </View>
  )
}

const ProfileContainer = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Change Password" component={EditPasswordScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default ProfileContainer;