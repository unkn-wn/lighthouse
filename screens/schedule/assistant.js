/*
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';

const Assistant = ({ navigation }) => {
  const [scheduleData, setScheduleData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const username = getAuth().currentUser.displayName;
      const docRef = doc(db, "users", username);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setScheduleData(docSnap.data().classes);
      } else {
        console.log("No schedule data found!");
      }
    };

    fetchData();
  }, []);

  return (
    <View className="bg-white w-screen h-screen pt-20 px-8">
      {scheduleData ? (
        <>
          <Text>Class Schedule:</Text>
          {scheduleData.classnames.map((classObj, index) => (
            <View key={index}>
              <Text>Class: {classObj.name}</Text>
              <Text>Address: {scheduleData.addresses[index]}</Text>
              <Text>Start Time: {new Date(scheduleData.startTimes[index].seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}</Text>
<Text>End Time: {new Date(scheduleData.endTimes[index].seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}</Text>
              <Text>Days: {Object.entries(scheduleData.days[index]).filter(([_, value]) => value).map(([day]) => day).join(', ')}</Text>
            </View>
          ))}
        </>
      ) : (
        <Text>Loading schedule data...</Text>
      )}
    </View>
  );
}

export default Assistant;
*/
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { PERMIT } from '../components/Permit';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

const Assistant = ({ navigation }) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [parkingData, setParkingData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestParkingSpots, setClosestParkingSpots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const username = getAuth().currentUser.displayName;
      const docRef = doc(db, "users", username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setScheduleData(docSnap.data().classes);
      } else {
        console.log("No schedule data found!");
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
      if (location == null) {
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        } catch (error) {
          console.error("Error getting current position", error);
        }
      }
      setUserLocation(location);

      const querySnapshot = await getDocs(collection(db, "parking"));
      const docs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setParkingData(docs);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (scheduleData && parkingData) {
      const closestSpots = findClosestParkingSpots(scheduleData, parkingData);
      setClosestParkingSpots(closestSpots);
    }
  }, [scheduleData, parkingData]);

  const findClosestParkingSpots = async (scheduleData, parkingData) => {
    const closestParkingSpots = [];
    if (scheduleData && scheduleData.addresses) {
      for (const classAddress of scheduleData.addresses) {
        try {
          const geocodeResult = await Geocoder.geocodeAddress(classAddress);
          if (geocodeResult.length > 0) {
            const { latitude, longitude } = geocodeResult[0].position;
            const classCoords = { latitude, longitude };

            let minDistance = Infinity;
            let closestParking = null;
            for (const parking of parkingData) {
              const distance = calculateDistance(classCoords, parking.coords);
              if (distance < minDistance) {
                minDistance = distance;
                closestParking = { ...parking, distance: minDistance };
              }
            }
            closestParkingSpots.push(closestParking);
          } else {
            console.warn(`No geocoding results found for address: ${classAddress}`);
            closestParkingSpots.push(null);
          }
        } catch (error) {
          console.error(`Geocoding error for address: ${classAddress}`, error);
          closestParkingSpots.push(null);
        }
      }
    }
    return closestParkingSpots;
  };

  function calculateDistance(coords1, coords2) {
    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  

  const userPermitAppliesToLocation = (item) => { // NOTE: CONSIDER REFRESHING PAGE IF USER CHANGES PERMIT??
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    let permitDetails = item.details;

    // get permit details for current day
    switch (day) {
      case 0:
        permitDetails = permitDetails.sunday;
        break;
      case 1:
        permitDetails = permitDetails.monday;
        break;
      case 2:
        permitDetails = permitDetails.tuesday;
        break;
      case 3:
        permitDetails = permitDetails.wednesday;
        break;
      case 4:
        permitDetails = permitDetails.thursday;
        break;
      case 5:
        permitDetails = permitDetails.friday;
        break;
      case 6:
        permitDetails = permitDetails.saturday;
        break;
      default:
        return false;
    }

    // check if current hour is within permit start and end time at location
    if ((permitDetails.startTime == -1 && permitDetails.endTime == -1) || (permitDetails.startTime < hour && hour < permitDetails.endTime)) {
      // permit hierarchy
      switch (PERMIT) {
        case PERMIT.A:
          if (permitDetails.permit && permitDetails.permit[0] == PERMIT.A) {
            return true;
          }
        case PERMIT.B:
          if (permitDetails.permit && permitDetails.permit[0] == PERMIT.B) {
            return true;
          }
        case PERMIT.C:
          if (permitDetails.permit && permitDetails.permit[0] == PERMIT.C) {
            return true;
          }
          break;
        case PERMIT.RES:
          if (permitDetails.permit && permitDetails.permit[0] == PERMIT.RES) {
            return true;
          }
          break;
        default:
          return false;
      }
    }
    return false;
  }

  return (
    <View className="bg-white w-screen h-screen pt-20 px-8">
      {scheduleData && closestParkingSpots.length > 0 ? (
        <>
          <Text>Class Schedule:</Text>
          {scheduleData.classnames.map((classObj, index) => (
            <View key={index}>
              <Text>Class: {classObj.name}</Text>
              <Text>Address: {scheduleData.addresses[index]}</Text>
              <Text>
                Start Time:{' '}
                {new Date(scheduleData.startTimes[index].seconds * 1000).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
              <Text>
                End Time:{' '}
                {new Date(scheduleData.endTimes[index].seconds * 1000).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
              <Text>
                Days:{' '}
                {Object.entries(scheduleData.days[index])
                  .filter(([_, value]) => value)
                  .map(([day]) => day)
                  .join(', ')}
              </Text>
              {closestParkingSpots[index] && (
                <>
                  <Text>Closest Parking: {closestParkingSpots[index].name}</Text>
                  <Text>Distance: {closestParkingSpots[index].distance.toFixed(2)} km</Text>
                </>
              )}
            </View>
          ))}
        </>
      ) : (
        <Text>Loading schedule and parking data...</Text>
      )}
    </View>
  );
};

export default Assistant;