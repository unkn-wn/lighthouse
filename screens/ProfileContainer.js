import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Textbox from './components/Textbox.js'

const Stack = createStackNavigator();

const EditPasswordScreen = ({navigation}) => {

  // Function to prompt the user for their password using an Alert
  // Used if re-authentication is needed
  // Only works on iOS?
  const promptUserForPassword = async () => new Promise((resolve) => {
    Alert.prompt(
      "Enter Password",
      "Please enter your current password",
      [
        {
          text: "Cancel",
          onPress: () => {
            ret = null;
            resolve(password);
          },
          style: 'cancel',
        },
        {
          text: "OK",
          onPress: password => {
            resolve(password);
          },
        }
      ],
      "secure-text"
    );
  })

  const checkPasswords = (newPassword, reEnter) => {

    var success = false;
    // check if the new passwords match
    if (newPassword != reEnter) {
      setError("Passwords don't match!");
      return;
    }

    // try to update the user's password in Firebase
    const user = getAuth().currentUser;
    updatePassword(user, newPassword).then(() => {
      navigation.navigate('Profile');
      success = true;
    }).catch(async (error) => {
      var message;
      if (error.code == 'auth/weak-password') {
        message = "Password should be at least 6 characters";
        console.log(message);
        setError(message);
      } else if (error.code == 'auth/requires-recent-login') {
        //user most likely needs to be reauthenticated

        console.log(error.message);
        
        
        console.log("hello bob")
        var password = await promptUserForPassword();
        console.log("password:");
        console.log(password);
        const credential = EmailAuthProvider.credential(user.email, password);
        console.log("after-credential");
        await reauthenticateWithCredential(user, credential).then(() => {
          console.log("logged in")
          updatePassword(user, newPassword).then(() => {
            success = true;
          }).catch((error) => {
            setError(error.message);
            return;
          });
        }).catch((error) => {
          console.log(error.message);
          message = error.message;
        }).finally(() => {
          console.log("end of func");
        })
      } else {
        console.log(error.message);
        setError(error.message);
      }
      //console.log("ending");
    }).finally(() => {
      //console.log("done");
      //setError(message);
      //console.log("error set");
      if (success) {
        Alert.alert('Password Updated!');
        navigation.navigate('Profile');
      }
    })
    //console.log('quite');
  }

    

  const [newPassword, onChangeNew] = useState('');
  const [reEnterPassword, onChangeRe] = useState('');
  const [error, setError] = useState('');

  // NOTE: disabled function for the button causes delay when entering text input
  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 items-center mt-20">
        <Text className="text-primary w-2/3 text-center">{error}</Text>
        <Textbox
          state={newPassword}
          setState={onChangeNew}
          placeholder="Enter new password"
          secureTextEntry={true}
        />
        <Textbox
          state={reEnterPassword}
          setState={onChangeRe}
          placeholder="Re-enter new password"
          secureTextEntry={true}
        />
        <Pressable
          className={!Boolean(newPassword && reEnterPassword) ?
                      "bg-disabled w-1/2 rounded-xl py-5 mt-3" : "bg-primary w-1/2 rounded-xl py-5 mt-3"}
          disabled={!Boolean(newPassword && reEnterPassword)}
          onPress={() => checkPasswords(newPassword, reEnterPassword)}
        >
          <Text className="text-white font-bold text-center text-lg">DONE</Text>
        </Pressable>
      </View>
    </View>
  )
}

const ProfileScreen = ({navigation}) => {
  
  const auth = getAuth();
  const user = auth.currentUser;

  var username;
  var email;
  if (user != null) {
    username = user.displayName;
    email = user.email;
  }

  return (
    <View style={styles.container}>
      <Text>These are your account details!</Text>
      <Text>Username: {username}</Text>
      <Text>Email: {email}</Text>
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