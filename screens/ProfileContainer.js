import React, { useEffect, useState, useRef } from 'react';
import { Switch, Pressable, SafeAreaView, Image, Text, TextInput, View, Alert, Keyboard, TouchableWithoutFeedback, requireNativeComponent } from 'react-native';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from "firebase/auth";
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign, Feather } from '@expo/vector-icons';
import { db } from '../firebaseConfig.js';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import GLOBAL from '../global.js';

import Textbox from './components/Textbox.js';
import DropdownMenu from './components/DropdownMenu.js';
import { Dropdown } from 'react-native-element-dropdown';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry.js';
import { PERMIT } from './components/Permit.js';
// import { Press } from 'hammerjs';

const Stack = createStackNavigator();

const EditPasswordScreen = ({ navigation }) => {

  useEffect(() => {
    let user = getAuth().currentUser;
    user.reload();
    if (user != null) {
      if (!user.emailVerified) {
        Alert.alert('Verify your email before changing credentials! Please check your inbox or spam folder for the verification email.');
        navigation.navigate('Profile');
      }
    }
  }, []);


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
    { label: PERMIT.A, value: PERMIT.A },
    { label: PERMIT.B, value: PERMIT.B },
    { label: PERMIT.C, value: PERMIT.C },
    { label: PERMIT.RES, value: PERMIT.RES },
  ];

  const listVehicles = [
    { label: 'None', value: 'None' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Compact', value: 'Compact' },
    { label: 'Handicap', value: 'Handicap' },
  ];

  const [permitType, setPermitType] = useState(null);
  const [vehicleType, setVehicleType] = useState(null);
  const [editUsername, setEditUsername] = useState(false);
  const [usernameChange, setUsernameChange] = useState(username);

  useEffect(() => {
    if (permitType != null) {
      setPermitTypeDatabase();
    }
  }, [permitType]);

  useEffect(() => {
    if (vehicleType != null) {
      setVehicleTypeDatabase();
    }
  }, [vehicleType]);

  useEffect(() => {
    // Check if user email is verified
    let user = getAuth().currentUser;
    user.reload();
    if (user != null) {
      if (!user.emailVerified && editUsername) {
        setEditUsername(false);
        Alert.alert('Verify your email before changing credentials! Please check your inbox or spam folder for the verification email.');
      }
    }

    if (!editUsername && username != usernameChange) {
      console.log('Changing username from', username, 'to', usernameChange);
      setUsernameDatabase();
    }
  }, [editUsername]);

  const getUserData = async (username) => {
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists()) {
          // console.log(doc.data());
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

  const setPermitTypeDatabase = async () => {
    await updateDoc(doc(db, "users", username), {
      permitType: permitType.value
    })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });
  }

  const setVehicleTypeDatabase = async () => {
    await updateDoc(doc(db, "users", username), {
      vehicleType: vehicleType.value
    })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });
  }

  async function checkDuplicateUsername() {
    const querySnapshot = await getDocs(collection(db, "users")).catch((error) => {
      console.log(error);
    });
    const data = querySnapshot.docs.map(doc => doc.data().username);
    for (let usern of data) {
      if (usern === usernameChange) {
        return true;
      }
    }
    return false;
  }

  const setUsernameDatabase = async () => {
    // Check if username already in use
    if (await checkDuplicateUsername()) {
      console.log('Error: Username already in use');
      setUsernameChange(username);
      setEditUsername(true);
      Alert.alert('Username already in use');
      return;
    }

    // Update new username in Firebase Auth
    updateProfile(user, {
      displayName: usernameChange
    }).then(() => {
      console.log('Username updated in auth:', auth.currentUser.displayName);
    }).catch((error) => {
      console.log('Error:', error);
      setError(error.message);
      return;
    });

    // Modify username is current doc
    await updateDoc(doc(db, "users", username), {
      username: usernameChange
    }).catch((error) => {
      console.log('Error:', error);
      return;
    });
    console.log('Changed username to', usernameChange);

    // Get old user profile in Firestore
    var copyData;
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists()) {
          copyData = doc.data();
        }
      })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });

    // Create new doc with duplicate data, except using new username
    if (copyData) {
      await setDoc(doc(db, "users", usernameChange), copyData);
      await deleteDoc(doc(db, "users", username));
      username = usernameChange;
      console.log("Username change completed");
    }
    else {
      console.log("Data does not exist");
    }
  }

  getUserData(username);

  return (
    <View className="flex-1 h-screen bg-white">
      <TouchableWithoutFeedback accessible={false} onPress={() => {
        Keyboard.dismiss;
        setEditUsername(false);
      }}
      >
        <View className="flex-1 mt-12">
          <View className="items-center">
            <Image className="object-scale-down h-32 w-32"
              source={require('../assets/logo.png/')}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            className="items-center justify-start absolute -top-5 right-5 my-3 z-10"
          >
            <Feather name="settings" size={28} color="#fe575f" />
          </Pressable>
          <View className="my-8 mx-10 items-center">
            <Text className="text-primary font-bold text-3xl">Profile</Text>
            <Textbox
              value={usernameChange}
              state={usernameChange}
              setState={setUsernameChange}
              editable={editUsername}
              onSubmitEditing={() => {
                setEditUsername(false);
              }}
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
            <Pressable onPress={() => {
              setEditUsername(true);
            }}>
              <Text className="mt-4 text-primary font-bold">Change Username</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Change Password')}>
              <Text className="mt-4 text-primary font-bold">Change Password</Text>
            </Pressable>
          </View>
          <View className="flex-1 justify-center items-center">
            <Pressable onPress={() => { getAuth().signOut().then(function () { GLOBAL.loggedIn = false; GLOBAL.scheduleCreated = false; navigation.navigate('Login'); console.log("Logged out!"); }) }} className="w-1/3 p-2 bg-primary justify-center items-center rounded-xl">
              <Text className="text-white font-bold text-xl">Log Out</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const SettingsScreen = ({ navigation }) => {



  const auth = getAuth();
  const user = auth.currentUser;

  var username;
  if (user != null) {
    username = user.displayName;
  }

  // get the initial settings
  const getSettingsData = async () => {
    await getDoc(doc(db, "users", username))
      .then((doc) => {
        if (doc.exists()) {
          setIsEnabled(doc.data().confirmCorrectLocation);
        }
      })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });
  }

  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = async () => {
    //console.log(previousState);
    setIsEnabled(previousState => !previousState);
    //send the update to firebase
    // for some reason, isEnabled is backwards
    await updateDoc(doc(db, "users", username), {
      confirmCorrectLocation: !isEnabled
    })
      .catch((error) => {
        console.log('Error:', error);
        return;
      });
  }

  useEffect(() => {
    getSettingsData();
  }, []);


  return (
    <View className="flex-1 h-screen bg-white">
      <View className="flex-1 items-center mt-10">
        <View className="flex-1 mt-0 max-h-10 w-full">
          <Switch
            className="absolute right-10"
            trackColor={{ false: '#8e8e93', true: '#fe575f' }}
            thumbColor={'#1e3446'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
          <Text className="text-secondary font-bold absolute left-7 text-xl">Confirm correct location</Text>
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  )
}

export default ProfileContainer;