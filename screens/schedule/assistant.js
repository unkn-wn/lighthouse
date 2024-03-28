import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { PERMIT } from '../components/Permit';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { apiKey } from '@env';

const auth = getAuth();

const fetchUserPermit = async () => {
  const username = auth.currentUser.displayName;
  const docRef = doc(db, "users", username);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userPermit = docSnap.data().permitType;
    return userPermit;
  } else {
    console.log("No user document found!");
    return null;
  }
};

const Assistant = ({ navigation }) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [parkingData, setParkingData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestParkingSpots, setClosestParkingSpots] = useState([]);
  const [selectedDay, setSelectedDay] = useState('monday');
  Geocoder.init(apiKey);

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

      const userPermit = await fetchUserPermit();

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
    const fetchClosestSpots = async () => {
      if (scheduleData && parkingData) {
        const closestSpots = await findClosestParkingSpots(scheduleData, parkingData);
        setClosestParkingSpots(closestSpots);
      }
    };
    fetchClosestSpots();
  }, [scheduleData, parkingData]);

  const findClosestParkingSpots = async (scheduleData, parkingData) => {
    const closestParkingSpots = [];
    if (scheduleData && scheduleData.addresses) {
      for (const classAddress of scheduleData.addresses) {
        try {
          const geocodeResult = await Geocoder.from(classAddress);
          if (geocodeResult != null) {
            const latitude = geocodeResult.results[0].geometry.location.lat;
            const longitude = geocodeResult.results[0].geometry.location.lng;
            const classCoords = { latitude, longitude };

            let minDistance = Infinity;
            let closestParking = null;
            for (const parking of parkingData) {
              const distance = calculateDistance(classCoords, parking.coords);
              //console.log(distance);
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
    //console.log("CLOSEST IS", closestParkingSpots, closestParkingSpots.length)
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
    if ((permitDetails.startTime == -1 && permitDetails.endTime == -1) || (permitDetails.startTime > hour || hour > permitDetails.endTime)) {
      // If there's no permit required or if the current time is outside the permit hours, anyone can park
      return true;
    }
    //console.log("my permit is", PERMIT);
    // permit hierarchy
    switch (PERMIT) {
      case PERMIT.A:
        // A permit can park in A and B and C places
        return permitDetails.permit.includes(PERMIT.A) || permitDetails.permit.includes(PERMIT.B) || permitDetails.permit.includes(PERMIT.C);
      case PERMIT.B:
        // B permit can park in B and C places
        return permitDetails.permit.includes(PERMIT.B) || permitDetails.permit.includes(PERMIT.C);
      case PERMIT.C:
        // C permit can only park in C places
        return permitDetails.permit.includes(PERMIT.C);
      case PERMIT.RES:
        // Residence permit can only park in RES places
        return permitDetails.permit.includes(PERMIT.RES);
      default:
        // No permit can only park if there's no permit required
        return permitDetails.permit.length === 0;
    }
  }

  const handleDaySelection = (day) => {
    setSelectedDay(day);
  }

  const dayMap = {
    'monday': 'M',
    'tuesday': 'T',
    'wednesday': 'W',
    'thursday': 'Th',
    'friday': 'F',
    // Add mappings for 'saturday' and 'sunday' if needed
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <View className="bg-white w-screen h-screen pt-12 px-4">
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
        <Text style={{ color: '#fe575f' }}>Go Back</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 20 }}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => handleDaySelection(day)}
              style={{ backgroundColor: selectedDay === day ? '#fe575f' : 'gray', padding: 10, marginRight: 10 }}
            >
              <Text style={{ color: 'white' }}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {scheduleData && closestParkingSpots ? (
          <>
            <Text>Parking Information for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}'s Classes:</Text>
            {scheduleData.classnames.map((classObj, index) => {
              if (!scheduleData.days[index][dayMap[selectedDay]]) {
                return null; // Skip this class if it doesn't occur on the selected day
              }
              return (
                <View key={index} style={{ marginBottom: 100 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Class: {classObj.name}</Text>
                  <Text>Address: {scheduleData.addresses[index]}</Text>
                  <Text>Start Time: {new Date(scheduleData.startTimes[index].seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}</Text>
                  <Text>End Time: {new Date(scheduleData.endTimes[index].seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}</Text>
                  <Text>Days: {Object.entries(scheduleData.days[index]).filter(([_, value]) => value).map(([day]) => day).join(', ')}</Text>
                  {closestParkingSpots[index] ? (
                    <>
                      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Closest Parking:</Text>
                      <Text>Name: {closestParkingSpots[index].name}</Text>
                      <Text>Address: {closestParkingSpots[index].address}</Text>
                      <Text>Distance: {closestParkingSpots[index].distance.toFixed(2)} km</Text>
                      <Text>Description: {closestParkingSpots[index].desc}</Text>
                      
                      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Parking Availability:</Text>
                      {Object.entries(closestParkingSpots[index].details).map(([day, details]) => {
                        if (day !== selectedDay) {
                          
                          return null; // Skip these parking details if they're not for the selected day
                        }
                        return (
                          <View key={day}>
                            <Text style={{ fontWeight: 'bold' }}>{day.charAt(0).toUpperCase() + day.slice(1)}:</Text>
                            <Text>Start Time: {details.startTime === -1 ? 'All Day' : `${details.startTime}:00`}</Text>
                            <Text>End Time: {details.endTime === -1 ? 'All Day' : `${details.endTime}:00`}</Text>
                            <Text>Permit: {details.permit.join(', ')}</Text>
                            <Text>
                              Can I park here?:{' '}
                              {userPermitAppliesToLocation(closestParkingSpots[index]) ? 'Yes' : 'No'}
                            </Text>
                          </View>
                        );
                      })}
                    </>
                  ) : (
                    <Text>No parking information available for this address.</Text>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <Text>Loading schedule data...</Text>
        )}
      </ScrollView>

    </View>
  );
};

export default Assistant;