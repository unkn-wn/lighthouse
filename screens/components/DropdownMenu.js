import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';

const DropdownMenu = (props) => {
  return (
    <Dropdown
      className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      itemContainerStyle={styles.itemContainerStyle}
      itemTextStyle={styles.itemTextStyle}
      data={props.data}
      labelField="label"
      valueField="value"
      placeholder={props.placeholder}
      value={props.placeholder + ": " + props.state}
      onChange={props.setState}
      {...props.state}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 41,
    paddingHorizontal: 8,
  },
  label: {
    position: 'absolute',
    backgroundColor: '#E0E0E0',
    fontSize: 14,
  },
  placeholderStyle: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  selectedTextStyle: {
    color: '#6b7280',
    fontSize: 14,
  },
  itemContainerStyle: {
    backgroundColor: '#E0E0E0',
  },
  itemTextStyle: {
    color: '#6b7280',
  },
});

export default DropdownMenu;