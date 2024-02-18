import { StyleSheet, Text, View, Pressable, Image, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';

import GLOBAL from '../global.js';

const LoginScreen = ({ navigation }) => {
    const [password, setPassword] = useState('');
    const [usernameEmail, setUsernameEmail] = useState('');

    function login() {
        GLOBAL.loggedIn = true;

        console.log('Username/Email: ', usernameEmail);
        console.log('Password: ', password);

        navigation.navigate('Home', { screen: 'Home' });
    }

    return (
        <View className="flex-1 h-screen bg-white">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 items-center mt-20">
                    <Image className="object-scale-down h-48 w-48"
                        source={require('../assets/logo.png/')}
                    />
                    <LoginTextInput
                        state={usernameEmail}
                        setState={setUsernameEmail}
                        placeholder="Username or Email"
                        secureTextEntry={false}
                    />
                    <LoginTextInput
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

function LoginTextInput({ placeholder, secureTextEntry, state, setState }) {
	return (
		<TextInput
			placeholder={placeholder}
			className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
			secureTextEntry={secureTextEntry}
			onChangeText={setState}
			{...state}
		/>
	)
}

export default LoginScreen;