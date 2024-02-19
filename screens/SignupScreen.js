import { Text, View, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import Textbox from './components/Textbox.js'
// https://icons.expo.fyi/Index

import GLOBAL from '../global.js';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypedPassword, setRetypePassword] = useState('');


  function signup() {
    GLOBAL.loggedIn = true;

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Retyped Password:', retypedPassword);

    navigation.navigate('Home', { screen: 'Home' });
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