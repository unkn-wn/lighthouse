import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen.js';
import MapScreen from './screens/MapScreen.js'
import AccountContainer from './screens/AccountContainer.js'

import GLOBAL from './global.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>

      <Stack.Navigator>
        {GLOBAL.loggedIn ? (
          <Stack.Screen name="LoginDummy" component={() => null} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          </>
        )}
        <Stack.Screen name="Home" options={{ headerShown: false, gestureEnabled: false }} >
          {props => (
            <Tab.Navigator {...props}>
              <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
              <Tab.Screen
                name="Account Container"
                component={AccountContainer}
                options={{ headerShown: false }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>


    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;