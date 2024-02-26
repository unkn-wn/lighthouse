import { TextInput } from 'react-native';

const Textbox = (props) => {
    return (
        <TextInput
            placeholder={props.placeholder}
            className="bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2"
            secureTextEntry={props.secureTextEntry}
            editable={props.editable}
            value={props.value}
            onChangeText={props.setState}
            {...props.state}
        />
    )
}

export default Textbox;