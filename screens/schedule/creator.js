import React, { useEffect, useState, useRef, createRef } from 'react';
import {
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Entypo, Feather } from '@expo/vector-icons'; // https://icons.expo.fyi/Index

import { db } from '../../firebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import GLOBAL from '../../global.js';


const Creator = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [whichPicker, setWhichPicker] = useState({}); // { "which": "start", "index": 0 }

  const textInputRefs = useRef([]);
  const [classnames, setClassnames] = useState([{ "name": "Class 1", "edit": false }]);
  const [addresses, setAddresses] = useState([""]);
  const [startTimes, setStartTimes] = useState([null]);
  const [endTimes, setEndTimes] = useState([null]);
  const [days, setDays] = useState([{ "M": false, "T": false, "W": false, "Th": false, "F": false }]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = getAuth().currentUser.displayName;
        const docRef = doc(db, "users", username);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data().classes;

          setClassnames(data.classnames);
          setAddresses(data.addresses);
          setStartTimes(data.startTimes.map(time => new Date(time.seconds * 1000)));
          setEndTimes(data.endTimes.map(time => new Date(time.seconds * 1000)));
          setDays(data.days);

          setLoading(false);

          // Check if schedule has been created (very hacky code lol)
          if (Object.values(data).every(arr => arr.length === 0)) {
            GLOBAL.scheduleCreated = false;
          }
          if (GLOBAL.scheduleCreated == false && Object.values(data).every(arr => arr.length !== 0)) {
            navigation.navigate('Assistant');
            GLOBAL.scheduleCreated = true;
          }

        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    fetchData();
  }, []);


  // useEffect for managing refs
  useEffect(() => {
    textInputRefs.current = textInputRefs.current.slice(0, classnames.length);
    classnames.forEach((_, i) => {
      if (!textInputRefs.current[i]) {
        textInputRefs.current[i] = createRef();
      }
    });
  }, [classnames]);

  // useEffect for focusing TextInput
  useEffect(() => {
    classnames.forEach((item, index) => {
      if (item.edit && textInputRefs.current[index]) {
        textInputRefs.current[index].current.focus();
      }
    });
  }, [classnames]);

  const addClass = () => {
    setClassnames(prevClassnames => [...prevClassnames, { "name": "Class " + (prevClassnames.length + 1), "edit": false }]);
    setAddresses(prevAddresses => [...prevAddresses, ""]);
    setStartTimes(prevStartTimes => [...prevStartTimes, ""]);
    setEndTimes(prevEndTimes => [...prevEndTimes, ""]);
    setDays(prevDays => [...prevDays, { "M": false, "T": false, "W": false, "Th": false, "F": false }]);
  };

  const removeClass = (index) => {
    const className = classnames[index].name;

    Alert.alert(
      "Remove Class",
      `Are you sure you want to remove the class "${className}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            setClassnames(prevClassnames => prevClassnames.filter((_, i) => i !== index));
            setAddresses(prevAddresses => prevAddresses.filter((_, i) => i !== index));
            setStartTimes(prevStartTimes => prevStartTimes.filter((_, i) => i !== index));
            setEndTimes(prevEndTimes => prevEndTimes.filter((_, i) => i !== index));
            setDays(prevDays => prevDays.filter((_, i) => i !== index));
          }
        }
      ],
      { cancelable: false }
    );
  };

  const updateDays = (day, index) => {
    setDays((prevDays) => {
      let newDays = [...prevDays];
      newDays[index][day] = !newDays[index][day];
      return newDays;
    });
  }

  const submit = () => {
    // console.log("---------- SUBMIT ----------")
    // console.log("Classnames:", classnames);
    // console.log("Addresses:", addresses);
    // console.log("Start Times:", startTimes);
    // console.log("End Times:", endTimes);
    // console.log("Days:", days);

    let data = {
      "classnames": [...classnames],
      "addresses": [...addresses],
      "startTimes": [...startTimes],
      "endTimes": [...endTimes],
      "days": [...days]
    };

    for (let i = 0; i < data.classnames.length; i++) {
      if (data.addresses[i] === "" || data.startTimes[i] === "" || data.endTimes[i] === "") {
        Alert.alert("Please fill in all fields for each class.");
        return;
      }
    }

    const username = getAuth().currentUser.displayName;

    try {
      setDoc(doc(db, "users", username), { "classes": data }, { merge: true });
    } catch (error) {
      console.error('Error:', error);
      return;
    };

    navigation.navigate('Assistant');
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fe575f" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View className="bg-white w-screen pt-10 px-10 mb-48">
                <Text className="text-3xl font-bold mb-6 text-left text-primary">Scheduling{"\n"}Assistant</Text>

                {classnames.map((_, index) => {
                  return (
                    <View key={index} className="flex-col mt-4">
                      <View className="flex-row justify-between">
                        <View className="flex-row gap-3 items-center">
                          <TextInput className="text-2xl font-bold text-primary -translate-y-0.5"
                            ref={textInputRefs.current[index]}
                            value={classnames[index].name}
                            onChangeText={(text) => {
                              setClassnames(classnames.map((item, idx) => idx === index ? { ...item, name: text } : item));
                            }}
                            editable={classnames[index].edit}
                            onFocus={() => {
                              setClassnames(classnames.map((item, idx) => idx === index ? { ...item, edit: true } : item));
                            }}
                            onBlur={() => {
                              setClassnames(classnames.map((item, idx) => idx === index ? { ...item, edit: false } : item));
                            }}
                          />
                          <Pressable onPress={() => {
                            setClassnames(classnames.map((item, idx) => idx === index ? { ...item, edit: true } : item));
                          }}>
                            <Feather name="edit-2" size={16} color="#fe575f" />
                          </Pressable>
                        </View>
                        <Pressable onPress={() => removeClass(index)} className="bg-primary w-8 h-8 rounded-xl justify-center items-center">
                          <Entypo name="minus" size={24} color="white" />
                        </Pressable>
                      </View>

                      <TextInput
                        placeholder="Address"
                        className="bg-gray-300 text-black w-full rounded-xl py-3 px-2 my-2"
                        onChangeText={(newAddress) => {
                          setAddresses(prevAddresses => prevAddresses.map((address, idx) => idx === index ? newAddress : address));
                        }}
                        value={addresses[index]}
                      />

                      <View className="flex flex-row gap-2">
                        <Pressable onPress={() => { setDatePickerVisibility(true); setWhichPicker({ "which": "start", "index": index }) }} className="flex-1 bg-gray-300 text-black rounded-xl py-3 px-2 my-2">
                          <Text className={startTimes[index] ? "text-black" : "text-gray-400"}>
                            {startTimes[index] ? startTimes[index].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Start Time"}
                          </Text>
                        </Pressable>
                        <View className='bg-primary h-1 w-4 rounded self-center' />

                        <Pressable onPress={() => { setDatePickerVisibility(true); setWhichPicker({ "which": "end", "index": index }) }} className="flex-1 bg-gray-300 text-black rounded-xl py-3 px-2 my-2">
                          <Text className={endTimes[index] ? "text-black" : "text-gray-400"}>
                            {endTimes[index] ? endTimes[index].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "End Time"}
                          </Text>
                        </Pressable>
                      </View>

                      <View className="flex flex-row gap-2">
                        <Pressable onPress={() => updateDays("M", index)} className={`flex-1 rounded-full p-2 my-2 border-2 border-primary ${days[index]["M"] ? "bg-primary" : ""}`}>
                          <Text className={`font-bold text-center ${days[index]["M"] ? "text-white" : "text-primary"}`}>M</Text>
                        </Pressable>
                        <Pressable onPress={() => updateDays("T", index)} className={`flex-1 rounded-full p-2 my-2 border-2 border-primary ${days[index]["T"] ? "bg-primary" : ""}`}>
                          <Text className={`font-bold text-center ${days[index]["T"] ? "text-white" : "text-primary"}`}>T</Text>
                        </Pressable>
                        <Pressable onPress={() => updateDays("W", index)} className={`flex-1 rounded-full p-2 my-2 border-2 border-primary ${days[index]["W"] ? "bg-primary" : ""}`}>
                          <Text className={`font-bold text-center ${days[index]["W"] ? "text-white" : "text-primary"}`}>W</Text>
                        </Pressable>
                        <Pressable onPress={() => updateDays("Th", index)} className={`flex-1 rounded-full p-2 my-2 border-2 border-primary ${days[index]["Th"] ? "bg-primary" : ""}`}>
                          <Text className={`font-bold text-center ${days[index]["Th"] ? "text-white" : "text-primary"}`}>Th</Text>
                        </Pressable>
                        <Pressable onPress={() => updateDays("F", index)} className={`flex-1 rounded-full p-2 my-2 border-2 border-primary ${days[index]["F"] ? "bg-primary" : ""}`}>
                          <Text className={`font-bold text-center ${days[index]["F"] ? "text-white" : "text-primary"}`}>F</Text>
                        </Pressable>
                      </View>

                    </View>

                  );
                })}

                <View className="flex flex-row justify-between">
                  <Pressable onPress={addClass} className="bg-primary w-10 h-10 rounded-xl justify-center items-center">
                    <Entypo name="plus" size={36} color="white" />
                  </Pressable>
                  <Pressable onPress={submit} className="bg-primary w-20 h-10 rounded-xl justify-center items-center">
                    <Text className="text-white font-bold text-xl">Done</Text>
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
                if (whichPicker.which === "start") {
                  setStartTimes(prevStartTimes => {
                    let newStartTimes = [...prevStartTimes];
                    newStartTimes[whichPicker.index] = date;
                    return newStartTimes;
                  });
                } else if (whichPicker.which === "end") {
                  setEndTimes(prevEndTimes => {
                    let newEndTimes = [...prevEndTimes];
                    newEndTimes[whichPicker.index] = date;
                    return newEndTimes;
                  });
                }
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default Creator;