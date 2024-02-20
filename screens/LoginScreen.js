import { Text, View, Pressable, Image, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection } from 'firebase/firestore';

import Textbox from './components/Textbox.js'
import GLOBAL from '../global.js';
import { db, auth } from '../firebaseConfig.js';

const LoginScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [usernameEmail, setUsernameEmail] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const errorMessage = "Username/email or password is incorrect";

  useEffect(() => {
    if (email != '') {
      console.log('Email State Updated: ', email);
      login();
    }
  }, [email]);

  const loginInfo = async () => {
    GLOBAL.loggedIn = true;
    setError('');

    if (usernameEmail === '' || password === '') {
      console.log('Error: All fields must be filled out');
      setError('All fields must be filled out');
      return;
    }

    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!usernameEmail.match(emailFormat)) {
      await getDoc(doc(db, "users", usernameEmail))
        .then((doc) => {
          if (doc.exists()) {
            console.log(doc.data());
            setEmail(doc.data().email);
            return;
          } else {
            console.log("Error: no user found for username/email");
            setError(errorMessage);
            return;
          }
        })
        .catch((error) => {
          console.log('Error:', error);
          setError(errorMessage);
          return;
        }
      );
    } else {
      setEmail(usernameEmail);
    }
  }

  const login = async () => {
    if (error == '') {
      console.log('Email:', email);
      console.log('Password: ', password);
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          console.log('User logged in:', userCredential.user.uid);
          navigation.navigate('Home', { screen: 'Home' });
          // const user = firebase.auth().currentUser;
        })
        .catch((error) => {
          console.log('Error:', error.message);
          setError(errorMessage);
        }
      );
    }
  }

  return (
    <View className="flex-1 h-screen bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 items-center mt-20">
          <Image className="object-scale-down h-48 w-48"
            source={require('../assets/logo.png/')}
          />
          <Text className="text-primary w-2/3 text-center">{error}</Text>
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
            onPress={() => {setError(''); loginInfo()}}
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