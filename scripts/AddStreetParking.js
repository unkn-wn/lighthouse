import { db } from '../firebaseConfig.js';
import { doc, setDoc, GeoPoint } from "firebase/firestore";
import { Button } from 'react-native';
import { PARKING } from '../screens/components/Parking.js';
import { PERMIT } from '../screens/components/Permit.js';


const AddStreetParking = () => {

  const add = async () => {
    // params
    const latitude = 40.434318;
    const longitude = -86.922857;
    const street = "Hilltop Dr";
    const parking = PARKING.STREET;
    const type = "Street Parking";
    const dayData = {
      cost: [],
      endTime: -1,
      permit: [PERMIT.RES],
      startTime: -1,
    }

    // check to make sure all data fields are accurate before adding to database
    const data = {
      address: "",
      alwaysFree: false,
      coords: new GeoPoint(latitude, longitude),
      desc: "On campus residence hall parking. Requires a Residence Halls Parking Permit.",
      details: {
        monday: dayData,
        tuesday: dayData,
        wednesday: dayData,
        thursday: dayData,
        friday: dayData,
        saturday: dayData,
        sunday: dayData,
      },
      name: street + " " + type,
      parkingType: parking,
    };

    const idName = data.name.replace(/ /g,'') + "";

    try {
      await setDoc(doc(db, "parking", idName), data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Button
      onPress={add}
      title="Add Parking"
    />
  )
}

export default AddStreetParking;