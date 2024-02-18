import { Text, View, Pressable, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import Textbox from '../components/Textbox.js'

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