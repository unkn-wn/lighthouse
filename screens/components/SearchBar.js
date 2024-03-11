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
      placeholder="Search..."
    />
  );
};

const styles = StyleSheet.create({
  input: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 1,
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
