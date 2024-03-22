import React from 'react';
import { Text, View, Pressable } from 'react-native';

const Assistant = ({ navigation, route }) => {
  const scheduleData = route.params?.scheduleData;

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <View className="bg-white w-screen h-screen pt-20 px-8">
        <Text className="text-2xl font-bold mb-4">Schedule Assistant</Text>
        {scheduleData ? (
          <>
            {scheduleData.classnames.map((className, index) => (
              <View key={index} className="mb-4">
                <Text className="text-lg font-bold">{className.name}</Text>
                <Text>Address: {scheduleData.addresses[index]}</Text>
                <Text>Start Time: {formatTime(scheduleData.startTimes[index])}</Text>
                <Text>End Time: {formatTime(scheduleData.endTimes[index])}</Text>
                <Text>Days: {Object.keys(scheduleData.days[index]).filter(day => scheduleData.days[index][day]).join(', ')}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text>No schedule data available.</Text>
        )}
        <Pressable onPress={() => navigation.navigate('Creator')}>
          <Text className="text-blue-500">Go to Creator</Text>
        </Pressable>
      </View>
    </>
  );
};

export default Assistant;