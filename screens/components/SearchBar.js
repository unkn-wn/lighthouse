import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SearchContext } from './SearchContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { apiKey } from '@env';

const SearchBar = () => {
  const { searchText, setSearchText } = useContext(SearchContext);
  const googlePlacesRef = useRef();

  useEffect(() => {
    // Set the address text whenever searchText changes
    if (googlePlacesRef.current) {
      googlePlacesRef.current.setAddressText(searchText);
    }
  }, [searchText]);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder='Search...'
        fetchDetails={true}
        onPress={(data, details = null) => {
          setSearchText(data.description);
        }}
        query={{
          key: apiKey,
          language: 'en',
        }}
        styles={{
          textInput: styles.input,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SearchBar;
