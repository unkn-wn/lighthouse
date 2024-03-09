import { db } from '../firebaseConfig.js';
import { doc, setDoc, GeoPoint } from "firebase/firestore";
import { Button } from 'react-native';
import { PARKING } from '../screens/components/Parking.js';
import { PERMIT } from '../screens/components/Permit.js';


const AddStreetParking = () => {

  const add = async () => {
    // params
    const latitude = 40.415367;
    const longitude = -86.916744;
    const street = "Ahlers Dr";
    const parking = PARKING.LOT;
    const type = "Parking Lot";
    const dayData = {
      cost: [],
      endTime: 17,
      permit: [PERMIT.A],
      startTime: 7,
    }
    const emptyData = {
      cost: [],
      endTime: -1,
      permit: [],
      startTime: -1,
    }

    // check to make sure all data fields are accurate before adding to database
    const data = {
      address: "",
      alwaysFree: false,
      coords: new GeoPoint(latitude, longitude),
      desc: "On campus parking lot. Requires an A Parking Permit.",
      details: {
        monday: dayData,
        tuesday: dayData,
        wednesday: dayData,
        thursday: dayData,
        friday: dayData,
        saturday: emptyData,
        sunday: emptyData,
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