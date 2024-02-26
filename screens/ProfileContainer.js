import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, Image, Text, TextInput, View, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';
import { db } from '../firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';

import Textbox from './components/Textbox.js';
import DropdownMenu from './components/DropdownMenu.js';
import { Dropdown } from 'react-native-element-dropdown';
// import { Press } from 'hammerjs';

const Stack = createStackNavigator();

const EditPasswordScreen = ({ navigation }) => {

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

  // Try to update the user's password with the new password
  const checkPasswords = (newPassword, reEnter) => {

    var success = false;
    var message;
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
      // handle errors
      if (error.code == 'auth/weak-password') {
        message = "Password should be at least 6 characters";
        console.log(message);
      } else if (error.code == 'auth/requires-recent-login') {
        // user needs to be reauthenticated

        //console.log(error.message);
        var password = await promptUserForPassword();
        //console.log("password:");
        //console.log(password);
        const credential = EmailAuthProvider.credential(user.email, password);
        //console.log("after-credential");
        await reauthenticateWithCredential(user, credential).then(() => {
          //console.log("logged in")

          // everything works except maybe this updatePassword() call
          updatePassword(user, newPassword).then(() => {
            success = true;
          }).catch((error) => {
            message = error.message;
            return;
          });

        }).catch((error) => {
          //console.log(error.message);
          message = error.message;
        }).finally(() => {
          //console.log("end of func");
        })
      } else {
        //console.log(error.message);
        message = error.message;
      }
      //console.log("ending");
    }).finally(() => {
      //console.log("done");
      setError(message);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 items-center mt-20">
          <View className='flex flex-row w-3/4'>
            <Pressable onPress={() => navigation.navigate('Profile')} className="pt-1.5 mr-2">
              <AntDesign name="caretleft" size={24} style={{ color: '#fe575f' }} />
            </Pressable>
            <Text className="text-3xl font-bold mb-4 text-left text-primary">Change Password</Text>
          </View>
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
      </TouchableWithoutFeedback>
    </View>
  )
}

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  var username;
  var email;
  if (user != null) {
    username = user.displayName;
    email = user.email;
  }

  const listPermits = [
    { label: 'None', value: 'None' },
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'CG', value: 'CG' },
    { label: 'ID', value: 'ID' },
  ];

  const listVehicles = [
    { label: 'None', value: 'None' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Compact', value: 'Compact' },
    { label: 'Handicap', value: 'Handicap' },
  ];

  const [permitType, setPermitType] = useState(null);
  const [vehicleType, setVehicleType] = useState(null);

  const getUserData = async (username) => {
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists()) {
          console.log(doc.data());
          if (doc.data().permitType != '') {
            // console.log('setting permit type');
            setPermitType(doc.data().permitType);
          }
          if (doc.data().vehicleType != '') {
            // console.log('setting vehicle type');
            setVehicleType(doc.data().vehicleType);
          }
        }
      })
      .catch((error) => {
        console.log('Error:', error);
        return;
      }
      );
  }

  getUserData(username);

  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 mt-12">
        <View className="items-center">
          <Image className="object-scale-down h-32 w-32"
            source={require('../assets/logo.png/')}
          />
        </View>
        <View className="my-8 mx-10 items-center">
          <Text className="text-primary font-bold text-3xl">Profile</Text>
          <Textbox
            value={username}
            editable={false}
          />
          <Textbox
            value={email}
            editable={false}
          />
          <DropdownMenu
            placeholder="Permit Type"
            data={listPermits}
            state={permitType}
            setState={setPermitType}
            onChange={item => {
              setPermitType(item.value);
            }}
          />
          <DropdownMenu
            placeholder="Vehicle Type"
            data={listVehicles}
            state={vehicleType}
            setState={setVehicleType}
            onChange={item => {
              setVehicleType(item.value);
            }}
          />
          <Pressable onPress={() => navigation.navigate('Change Password')}>
            <Text className="mt-4 text-primary font-bold">Change Password</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const ProfileContainer = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Change Password" component={EditPasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default ProfileContainer;