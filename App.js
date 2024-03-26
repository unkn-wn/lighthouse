import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
import React, { useState, useEffect, createContext } from 'react';

import * as Notifications from 'expo-notifications';
import { useTriggerNotifications, NotificationContext } from './screens/components/NotificationHandler.js';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
  })
});

import { StyleSheet, Text, View, Button, Linking, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen.js';
import MapScreen from './screens/MapScreen.js'
import ProfileContainer from './screens/ProfileContainer.js'
import ListContainer from './screens/ListContainer.js'
import ScheduleContainer from './screens/schedule/ScheduleContainer.js';
import { SearchContext } from './screens/components/SearchContext';


import GLOBAL from './global.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const triggerNotifications = useTriggerNotifications();

  const [modalVisible, setModalVisible] = useState(false);

  // Notifications
  useEffect(() => {
    (async () => {
      let { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setModalVisible(true);
        return;
      }
    })();
  }, []);

  // Fixes constant warning about passing an inline function as the component to a Screen
  const NullScreen = () => null;

  const [searchText, setSearchText] = useState('');

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-5/6 p-4 rounded-lg">
            <Text>Notification permissions were denied. Lighthouse requires notifications to alert you about potential parking changes. Open settings?</Text>
            {/* Ok and Cancel buttons */}
            <View className="flex-row justify-around mt-2">
              <Button title="No" onPress={() => setModalVisible(false)} />
              <Button title="Yes" onPress={() => { Linking.openSettings(); setModalVisible(false) }} />
            </View>
          </View>
        </View>
      </Modal>
      <NotificationContext.Provider value={triggerNotifications}>
        <SearchContext.Provider value={{ searchText, setSearchText }}>
          <NavigationContainer>

            <Stack.Navigator>
              {GLOBAL.loggedIn ? (
                <Stack.Screen name=" " component={NullScreen} />
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
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
                      name="Schedule Container"
                      component={ScheduleContainer}
                      options={{ title: 'Schedule', headerShown: false }}
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
        </SearchContext.Provider>
      </NotificationContext.Provider>
    </>
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