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