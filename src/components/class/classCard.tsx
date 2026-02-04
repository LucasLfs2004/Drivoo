import theme from "../../themes/index";
import { scale } from "../../utils/scale";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ClassCardProps {
  instructorName?: string;
  time?: string;
  location?: string;
  instructorId?: string;
  onPress?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  instructorName = "Ricardo",
  time = "10:00",
  location = "Avenida Belmira Marin",
  onPress,
}) => {
    return (
        <TouchableOpacity style={style.container} onPress={onPress} activeOpacity={0.7}>
            <View style={style.imgView}>
                <Image style={style.imgIcon} source={require("../../assets/car.png")} />
            </View>
            <View style={style.infoView}>
                <Text style={style.title}>
                    {instructorName}
                </Text>
                <Text style={style.text}>
                    {time} {location}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    container: {

        display: "flex",
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: scale(16),
        backgroundColor: "#E6ECEF",
        borderRadius: scale(8),
        paddingHorizontal: scale(8),
        paddingVertical: scale(8)
    },
    imgView: {
        width: scale(42),
        height: scale(42),
        backgroundColor: "#EBEFF0",
        borderRadius: scale(28),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgIcon: {
        width: scale(32),
        height: scale(32),
    },
    infoView: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: scale(4)
    },
    title: {
        fontWeight: theme.typography.fontWeight.medium,
        fontSize: theme.typography.fontSize.sm
    },
    text: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    }
})

export default ClassCard;