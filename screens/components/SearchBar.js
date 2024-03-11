import { useContext } from 'react';
import { SearchContext } from './SearchContext';
import { TextInput, StyleSheet } from 'react-native';

const SearchBar = () => {
  const { searchText, setSearchText } = useContext(SearchContext);

  return (
    <TextInput
      style={styles.input}
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Search..." // Optional: Add a placeholder
      // Other TextInput props
    />
  );
};

const styles = StyleSheet.create({
  input: {
    position: 'absolute',
    top: 60,
    left: 20, // Adjusted for padding from the screen edge
    right: 20, // Adjusted for padding from the screen edge
    backgroundColor: 'white', // Sets the background color to white
    height: 40, // Set a fixed height
    paddingHorizontal: 10, // Horizontal padding
    borderRadius: 20, // Rounded corners
    zIndex: 1,
    // Shadow properties
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0, // Horizontal shadow offset
      height: 2, // Vertical shadow offset
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius

    // For Android elevation shadow
    elevation: 5,
  },
});

export default SearchBar;
