import { StyleSheet, Text, View, Button } from 'react-native';

const AccountScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>These are your account details!</Text>
    </View>
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

export default AccountScreen;