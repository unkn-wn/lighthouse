import { TextInput } from 'react-native';
import PropTypes from 'prop-types';

export default class Textbox {
    render() {
        return (
            <TextInput
                placeholder={placeholder}
                className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
                secureTextEntry={secureTextEntry}
                onChangeText={setState}
                {...state}
            />
        )
    }
}

Textbox.PropTypes = { placeholder: PropTypes.string.isRequired, secureTextEntry: PropTypes.bool, state: PropTypes.string, setState: PropTypes.func }