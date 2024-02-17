import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator();

const EditPasswordScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>Edit your password!</Text>
    </View>
  )
}

const AccountScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>These are your account details!</Text>
      <Button
        title="Change Password"
        onPress = {() =>
          navigation.navigate('Change Password')
        }
      />
    </View>
  )
}

const AccountContainer = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Change Password" component={EditPasswordScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AccountContainer;