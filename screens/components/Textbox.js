import { TextInput } from 'react-native';

const Textbox = (props) => {
    var className;
    if (props.editable == false) {
        className = "bg-gray-300 text-black w-3/4 rounded-xl py-3 px-2 my-2";
    }
    else {
        className = "bg-gray-300 text-gray-500 w-3/4 rounded-xl py-3 px-2 my-2";
    }

    return (
        <TextInput
            placeholder={props.placeholder}
            className={className}
            secureTextEntry={props.secureTextEntry}
            editable={props.editable}
            value={props.value}
            onChangeText={props.setState}
            onSubmitEditing={props.onSubmitEditing}
            {...props.state}
        />
    )
}

export default Textbox;