import React, { useEffect, useState, useRef } from 'react';
import { Text, TextInput, View, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Entypo, Feather } from '@expo/vector-icons'; // https://icons.expo.fyi/Index

import Textbox from '../components/Textbox';


const Creator = ({ navigation }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [whichPicker, setWhichPicker] = useState({}); // { "which": "start", "index": 0 }

  const [classnames, setClassnames] = useState([{ "name": "Class 1", "edit": false, "ref": useRef(null) }]);
  const [addresses, setAddresses] = useState([""]);
  const [startTimes, setStartTimes] = useState([""]);
  const [endTimes, setEndTimes] = useState([""]);


  useEffect(() => {

    if (whichPicker.which === "start") {

      setStartTimes((prevStartTimes) => {
        let newStartTimes = [...prevStartTimes];
        newStartTimes[whichPicker.index] = selectedDate;
        return newStartTimes;
      });

      console.log(startTimes);

    } else if (whichPicker.which === "end") {

      setEndTimes((prevEndTimes) => {
        let newEndTimes = [...prevEndTimes];
        newEndTimes[whichPicker.index] = selectedDate;
        return newEndTimes;
      });

      console.log(endTimes);
    }

  }, [selectedDate]);

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="bg-white w-screen h-screen pt-20 px-10">
          <Text className="text-3xl font-bold mb-12 text-left text-primary">Scheduling{"\n"}Assistant</Text>

          <View className="bg-blue-100 flex-col">
            <View className="flex-row gap-3 items-center">
              <TextInput className="text-2xl font-bold text-primary -translate-y-0.5"
                ref={classnames[0].ref}
                value={classnames[0].name}
                onChangeText={(text) => setClassnames([{ ...classnames[0], name: text }])}
                editable={classnames[0].edit}
                onFocus={() => setClassnames([{ ...classnames[0], edit: true }])}
                onBlur={() => setClassnames([{ ...classnames[0], edit: false }])}
              />
              <Pressable onPress={() => {
                setClassnames([{ ...classnames[0], edit: true }]);
                Keyboard.dismiss();
                setTimeout(() => {
                  classnames[0].ref.current.focus();
                }, 50);
              }}>
                <Feather name="edit-2" size={16} color="#fe575f" />
              </Pressable>
            </View>

            <Textbox placeholder="Address" className="bg-gray-300 text-black w-full rounded-xl py-3 px-2 my-2" setState={setAddresses[0]} state={addresses[0]} />

            <Pressable onPress={() => {setDatePickerVisibility(true); setWhichPicker({"which": "start", "index": 0}) }} className="bg-gray-300 text-black w-1/2 rounded-xl py-3 px-2 my-2">
              <Text className={startTimes[0] ? "text-black" : "text-gray-400"}>{startTimes[0] ? startTimes[0].toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Start Time"}</Text>
            </Pressable>

            <Pressable onPress={() => {setDatePickerVisibility(true); setWhichPicker({"which": "end", "index": 0}) }} className="bg-gray-300 text-black w-1/2 rounded-xl py-3 px-2 my-2">
              <Text className={endTimes[0] ? "text-black" : "text-gray-400"}>{endTimes[0] ? endTimes[0].toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "End Time"}</Text>
            </Pressable>


            <Pressable onPress={() => navigation.navigate('Assistant')} className="bg-primary w-10 h-10 rounded-xl justify-center items-center">
              <Entypo name="plus" size={36} color="white" />
            </Pressable>


          </View>
        </View>
      </TouchableWithoutFeedback>
      <DateTimePickerModal
        date={selectedDate}
        isVisible={isDatePickerVisible}
        textColor='black'
        mode="time"
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          setSelectedDate(date);
          console.log(date.toLocaleTimeString());
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </>
  )
}

export default Creator;