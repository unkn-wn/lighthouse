import { StyleSheet, Text, View, Button, TextInput, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
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
							<AntDesign name="caretleft" size={24} style={{ color:'#fe575f' }} />
						</Pressable>
						<Text className="text-3xl font-bold mb-20 text-left text-primary">Create Account</Text>
					</View>
					<SignupTextInput
						placeholder="Username"
						secureTextEntry={false}
						state={username}
						setState={setUsername}
					/>
					<SignupTextInput
						placeholder="Email address"
						secureTextEntry={false}
						state={email}
						setState={setEmail}
					/>
					<SignupTextInput
						placeholder="Password"
						secureTextEntry={true}
						state={password}
						setState={setPassword}
					/>
					<SignupTextInput
						placeholder="Re-enter password"
						secureTextEntry={true}
						state={retypedPassword}
						setState={setRetypePassword}
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

function SignupTextInput({ placeholder, secureTextEntry, state, setState }) {
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


export default SignupScreen;