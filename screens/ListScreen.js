import {Text, View, Button} from 'react-native';

const ListScreen = ({navigation}) => {
    return (
        <View classname="flex-1 h-screen bg-black">
            <View classname="flex-1 items-center mt-20">
                <Text className="text-black font-bold text-center text-lg">Parking Data</Text>
            </View>
        </View>
    )
}

export default ListScreen;