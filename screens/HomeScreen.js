import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import db from '../firebaseConfig.js'


const addToDB = async () => {
  try {
    console.log("ads;flsdf");
    const docRef = await addDoc(collection(db, "users"), {
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    Alert.alert("Doc written with ID: ", docRef.id);
  } catch (e) {
    Alert.alert("Error adding document, ", e);
  }
}
const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>This is the Home Screen</Text>
      <StatusBar style="auto" />
      <Button
        title="Update db"
        onPress={() => addToDB()}
      />
    </View>
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

export default HomeScreen;