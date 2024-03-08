import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Assistant from './assistant';
import Creator from './creator';


const Stack = createStackNavigator();

const ScheduleContainer = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen name="Creator" component={Creator} options={{ headerShown: false }} />
      <Stack.Screen name="Assistant" component={Assistant} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default ScheduleContainer;