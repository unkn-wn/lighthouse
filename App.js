import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen.js';
import MapScreen from './screens/MapScreen.js'
import ProfileContainer from './screens/ProfileContainer.js'
import ListContainer from './screens/ListContainer.js'

import GLOBAL from './global.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  
  // Fixes constant warning about passing an inline function as the component to a Screen
  const NullScreen = () => null;

  return (
    <NavigationContainer>

      <Stack.Navigator>
        {GLOBAL.loggedIn ? (
          <Stack.Screen name=" " component={NullScreen} />
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
                name="List Container"
                component={ListContainer}
                options={{ title: 'List', headerShown: false }}
              />
              <Tab.Screen
                name="Profile Container"
                component={ProfileContainer}
                options={{ title: 'Profile', headerShown: false }}
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