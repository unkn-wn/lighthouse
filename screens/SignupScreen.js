import { StyleSheet, Text, View, Button, TextInput, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
// https://icons.expo.fyi/Index

import GLOBAL from '../global.js';

const SignupScreen = ({ navigation }) => {
	function signup() {
		GLOBAL.loggedIn = true;
		navigation.navigate('Home', { screen: 'Home' });
	}

	return (
		<View className="flex-1 h-screen bg-white">
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<View className="flex-1 items-center mt-20">
					<View className='flex flex-row w-3/4'>
						<Pressable onPress={() => navigation.navigate('Login')} className="pt-1.5 mr-2">
							<AntDesign name="caretleft" size={24} style={{ color:'#fe575f' }} />
						</Pressable>
						<Text className="text-3xl font-bold mb-20 text-left text-primary">Create Account</Text>
					</View>
					<SignupTextInput
						placeholder="Username"
						secureTextEntry={false}
					/>
					<SignupTextInput
						placeholder="Email address"
						secureTextEntry={false}
					/>
					<SignupTextInput
						placeholder="Password"
						secureTextEntry={true}
					/>
					<SignupTextInput
						placeholder="Re-enter password"
						secureTextEntry={true}
					/>
					<Button
						title="Sign up"
						onPress={() => signup()}
					/>
				</View>
			</TouchableWithoutFeedback>
			<View className="my-12">
				<Text className="text-center">Already have an account?</Text>
				<Button
					title="Sign in!"
					className="text-red-300"
					onPress={() => navigation.navigate('Login')} />
			</View>
		</View>
	);
}

function SignupTextInput({ placeholder, secureTextEntry }) {
	return (
		<TextInput
			placeholder={placeholder}
			className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
			secureTextEntry={secureTextEntry}
		/>
	)
}


export default SignupScreen;