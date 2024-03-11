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
      // Other TextInput props
    />
  );
};

const styles = StyleSheet.create({
  input: {
    position: 'absolute',
    top: 60,
    left: 60,
    right: 0,
    zIndex: 1,
    // Add other styles as needed
  },
});

export default SearchBar;