import { Text, View, Pressable, Image, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useEffect, useState } from 'react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';

import Textbox from './components/Textbox.js'
import GLOBAL from '../global.js';
import db from '../firebaseConfig.js';

const LoginScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [usernameEmail, setUsernameEmail] = useState('');


  const login = async () => {
    GLOBAL.loggedIn = true;

    console.log('Username/Email: ', usernameEmail);
    console.log('Password: ', password);

    try {
      console.log("Adding...");
      const docRef = await addDoc(collection(db, "test"), {
        usernameEmail: usernameEmail,
        password: password
      }).catch(e => console.error(e));
      Alert.alert("Doc written with ID: ", docRef.id);
    } catch (e) {
      Alert.alert("Error adding document, ", e);
    }

    navigation.navigate('Home', { screen: 'Home' });
  }

  return (
    <View className="flex-1 h-screen bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 items-center mt-20">
          <Image className="object-scale-down h-48 w-48"
            source={require('../assets/logo.png/')}
          />
          <Textbox
            state={usernameEmail}
            setState={setUsernameEmail}
            placeholder="Username or Email"
            secureTextEntry={false}
          />
          <Textbox
            state={password}
            setState={setPassword}
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={setPassword}
          />
          <Pressable
            className="bg-primary w-1/2 rounded-xl py-5 mt-3"
            onPress={() => login()}
          >
            <Text className="text-white font-bold text-center text-lg">LOGIN</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
      <View className="my-12 flex-row justify-center space-x-1">
        <Text className="text-secondary">Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text className="text-primary">Sign up!</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default LoginScreen;