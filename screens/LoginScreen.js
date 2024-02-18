import { StyleSheet, Text, View, Button, Image, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';

import GLOBAL from '../global.js';

const LoginScreen = ({ navigation }) => {

    function login() {
        GLOBAL.loggedIn = true;
        navigation.navigate('Home', { screen: 'Home' });
    }

    return (
        <View className="flex-1 h-screen bg-white">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 items-center">
                    <Image className="object-scale-down h-48 w-48"
                        source={require('../assets/logo.png/')}
                    />
                    <LoginTextInput
                        placeholder="Username or Email"
                        secureTextEntry={false}
                    />
                    <LoginTextInput
                        placeholder="Password"
                        secureTextEntry={true}
                    />
                    <Button
                        title="Login"
                        onPress={() => login()}
                    />
                </View>
            </TouchableWithoutFeedback>
            <View className="my-12">
                <Text className="text-center">Don't have an account?</Text>
                <Button
                    title="Sign up!"
                    className="text-red-300"
                    onPress={() => navigation.navigate('Signup')} />
            </View>
        </View>
    );
}

function LoginTextInput({ placeholder, secureTextEntry }) {
    return (
        <TextInput
            placeholder={placeholder}
            className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
            secureTextEntry={secureTextEntry}
        />
    )
}

export default LoginScreen;