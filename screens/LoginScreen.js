import { Text, View, Pressable, Image, Button, Keyboard, TouchableWithoutFeedback, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, collection } from 'firebase/firestore';

import Textbox from './components/Textbox.js'
import GLOBAL from '../global.js';
import { db, auth } from '../firebaseConfig.js';

const LoginScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [usernameEmail, setUsernameEmail] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordPrompt, setForgotPasswordPrompt] = useState(false);
  const errorMessage = "Username/email or password is incorrect";

  useEffect(() => {
    if (email != '') {
      console.log('Email State Updated: ', email);
      login();
    }
  }, [email]);

  const loginInfo = async () => {
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
          GLOBAL.loggedIn = true;
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


  const sendForgotPass = async () => {
    console.log('Sending password reset:', usernameEmail);
    await sendPasswordResetEmail(auth, usernameEmail)
      .then(() => {
        alert('Password reset email sent! If you did not receive an email, please check that you entered the correct email address and check your spam folder.');
      })
      .catch((error) => {
        console.log('Error:', error.message);
        setError(error.message);
      });
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
            onPress={() => { setError(''); loginInfo() }}
          >
            <Text className="text-white font-bold text-center text-lg">LOGIN</Text>
          </Pressable>
          <Pressable
            className="mt-4"
            onPress={() => {setForgotPasswordPrompt(true); setUsernameEmail(''); }}
          >
            <Text className="text-primary">Forgot password?</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
      <View className="my-12 flex-row justify-center space-x-1">
        <Text className="text-secondary">Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text className="text-primary">Sign up!</Text>
        </Pressable>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={forgotPasswordPrompt}
        onRequestClose={() => {
          setForgotPasswordPrompt(false);
        }}
      >
        <View className="flex-1 pt-48 items-center bg-black/50">
          <View className="bg-white w-5/6 p-4 rounded-lg">
            <Text className="text-2xl text-primary font-bold">Forgot your password?</Text>
            <Text className="my-1">Enter your email and we'll send you a link to reset your password.</Text>
            <View className="flex-row gap-2 w-full mx-auto mt-2">
              <Textbox
                state={usernameEmail}
                setState={setUsernameEmail}
                placeholder="Email"
                secureTextEntry={false}
              />
              <Pressable
                className="bg-primary w-1/5 rounded-xl my-2"
                onPress={() => { setForgotPasswordPrompt(false); sendForgotPass(); }}
              >
                <Text className="text-white font-bold text-center text-md my-auto">RESET</Text>
              </Pressable>
            </View>
            <Pressable
                className="rounded-xl py-2"
                onPress={() => { setForgotPasswordPrompt(false); }}
              >
                <Text className="text-secondary font-bold text-center text-md my-auto">Cancel</Text>
              </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default LoginScreen;