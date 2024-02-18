import { StyleSheet, Text, View, Button } from 'react-native';

import GLOBAL from '../global.js';

const LoginScreen = ({ navigation }) => {

	function login() {
		GLOBAL.loggedIn = true;
		navigation.navigate('Home', { screen: 'Home' });
	}

	return (
		<View className="flex-1 h-screen">
			<View className="flex-1">
				<Text>This is the Login Screen</Text>
				<Button
					title="Go to Home"
					onPress={() => login()}
				/>
			</View>
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

export default LoginScreen;