import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

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
    <SafeAreaView>
      <TextInput
        style={styles.input}
        onChangeText={onChangeCur}
        value={currentPassword}
        placeholder="Enter current password"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeNew}
        value={newPassword}
        placeholder="Enter new password"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeRe}
        value={reEnterPassword}
        placeholder="Re-enter new password"
      />
      <Button
        color='#ff5661'
        title="Done"
        disabled={!Boolean(currentPassword && newPassword && reEnterPassword)}
        onPress={() => checkPasswords(currentPassword, newPassword, reEnterPassword)}
      />
    </SafeAreaView>
  )
}

const AccountScreen = ({navigation}) => {
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

const AccountContainer = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} />
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

export default AccountContainer;