import { StyleSheet, Text, View, Pressable, Image, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';

import GLOBAL from '../global.js';

const LoginScreen = ({ navigation }) => {

    function login() {
        GLOBAL.loggedIn = true;
        navigation.navigate('Home', { screen: 'Home' });
    }

    const [password, setPassword] = useState('');

    return (
        <View className="flex-1 h-screen bg-white">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 items-center mt-6">
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