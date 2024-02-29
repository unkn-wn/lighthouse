import { Text, View, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // https://icons.expo.fyi/Index
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';


import Textbox from './components/Textbox.js'
import GLOBAL from '../global.js';
import { db, auth } from '../firebaseConfig.js';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypedPassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');

  const signup = async () => {

    // check all fields are filled out and passwords match
    if (username === '' || email === '' || password === '' || retypedPassword === '') {
      console.log('Error: All fields must be filled out');
      setError('All fields must be filled out');
      return;
    }

    if (password !== retypedPassword) {
      console.log('Error: Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Retyped Password:', retypedPassword);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log('User signed up:', user.uid);

        updateProfile(user, {
          displayName: username
        }).then(() => {
          // Profile updated
          console.log('Profile updated:', auth.currentUser.displayName);
        }).catch((error) => {
          console.log('Error:', error);
          setError(error.message);
          user.delete();
          return;
        });

        try {
          const docRef = setDoc(doc(db, "users", email), {
            email: email,
            username: username,
            uid: user.uid
          });
          console.log("Doc written with ID: ", docRef.id);

        } catch(error) {
          console.error('Error:', error);
          setError(error.message);
          user.delete();
          return;
        };

        GLOBAL.loggedIn = true;
        navigation.navigate('Home', { screen: 'Home' });
      })
      .catch((error) => {
        console.log('Error:', error.message);
        const errorMessage = error.message.split('auth/')[1].split(')')[0];
        var message;
        if (errorMessage == 'weak-password') {
          message = "Password should be at least 6 characters";
        } else if (errorMessage == 'invalid-email') {
          message = "Invalid email";
        } else if (errorMessage == 'email-already-in-use') {
          message = "Email already in use";
        } else {
          message = error.message;
        }
        setError(message);
      });
  }


  return (
    <View className="flex-1 h-screen bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 items-center mt-20">
          <View className='flex flex-row w-3/4'>
            <Pressable onPress={() => navigation.navigate('Login')} className="pt-1.5 mr-2">
              <AntDesign name="caretleft" size={24} style={{ color: '#fe575f' }} />
            </Pressable>
            <Text className="text-3xl font-bold mb-20 text-left text-primary">Create Account</Text>
          </View>
          <Text className="text-primary w-2/3 text-center">{error}</Text>
          <Textbox
            placeholder="Username"
            secureTextEntry={false}
            state={username}
            setState={setUsername}
          />
          <Textbox
            placeholder="Email address"
            secureTextEntry={false}
            state={email}
            setState={setEmail}
          />
          <Textbox
            placeholder="Password"
            secureTextEntry={true}
            state={password}
            setState={setPassword}
          />
          <Textbox
            placeholder="Re-enter password"
            secureTextEntry={true}
            state={retypedPassword}
            setState={setRetypePassword}
          />
          <Pressable
            className="bg-primary w-1/2 rounded-xl py-5 mt-3"
            onPress={() => signup()}
          >
            <Text className="text-white font-bold text-center text-lg">SIGNUP</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
      <View className="my-12 flex-row justify-center space-x-1">
        <Text className="text-secondary">Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text className="text-primary">Log in!</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default SignupScreen;