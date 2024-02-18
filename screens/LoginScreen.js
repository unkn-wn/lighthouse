import { StyleSheet, Text, View, Button } from 'react-native';
import { useFonts } from 'expo-font';

import GLOBAL from '../global.js';

const LoginScreen = ({ navigation }) => {

	function login() {
		GLOBAL.loggedIn = true;
		navigation.navigate('Home', { screen: 'Home' });
	}

	return (
		<View>
			<Text>This is the Login Screen</Text>
			<Button
				title="Go to Home"
				onPress={() => login()}
			/>
		</View>
	);
}

export default LoginScreen;