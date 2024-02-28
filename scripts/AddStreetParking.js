import { db } from '../firebaseConfig.js';
import { doc, setDoc, GeoPoint } from "firebase/firestore";
import { Button } from 'react-native';
import { PARKING } from '../screens/components/Parking.js'


const AddStreetParking = () => {

  const add = async () => {
    // params
    const latitude = 40.420848;
    const longitude = -86.910602;
    const street = "Young Hall";
    const parking = PARKING.LOT;
    const clarification = "";

    const dayData = {
      cost: [],
      endTime: -1,
      permit: [],
      startTime: -1,
    }

    const data = {
      address: "",
      alwaysFree: false,
      coords: new GeoPoint(latitude, longitude),
      desc: "On campus metered parking. 15 minute minimum starting at $0.65, $0.25 per additional 15 minutes",
      details: {
        monday: dayData,
        tuesday: dayData,
        wednesday: dayData,
        thursday: dayData,
        friday: dayData,
        saturday: dayData,
        sunday: dayData,
      },
      name: street + ((parking == 2) ? " Street Parking" : " Metered Parking Lot") + clarification,
      parkingType: parking,
    };

    try {
      await setDoc(doc(db, "parking", data.name.replace(/ /g,'')), data);
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