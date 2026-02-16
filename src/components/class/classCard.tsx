import theme from "../../themes/index";
import { scale } from "../../utils/scale";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, Divider } from "../common";
import { Clock, Map } from "lucide-react-native";

interface ClassCardProps {
    instructorName?: string;
    time?: string;
    location?: string;
    instructorId?: string;
    onPress?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
    instructorName = "Ricardo",
    time = "02/03 - 10:00",
    location = "Avenida Belmira Marin",
    onPress,
}) => {
    return (
        <Card style={style.card}>
            <TouchableOpacity style={style.container} onPress={onPress} activeOpacity={0.7}>
                <View style={style.imgView}>
                    <Image style={style.imgIcon} source={require("../../assets/car.png")} />
                </View>
                <Divider spacing="sm" orientation="vertical" />
                <View style={style.infoView}>
                    <Text style={style.title}>
                        {instructorName}
                    </Text>
                    <View style={style.row}>
                        <Clock color={theme.colors.secondary[500]} size={scale(16)} />
                        <Text style={style.text}>
                            {time}
                        </Text>
                    </View>
                    <View style={style.row}>
                        <Map color={theme.colors.secondary[500]} size={scale(16)} />
                        <Text style={style.text}>
                            {location}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
    )
}

const style = StyleSheet.create({
    card: {
        paddingHorizontal: theme.spacing.sm,
    },
    container: {

        display: "flex",
        flexDirection: 'row',
        alignItems: 'flex-start',
        // justifyContent: 'space-between',
        // columnGap: theme.spacing.md,
        // backgroundColor: "#E6ECEF",
        borderRadius: scale(8),
        // paddingVertical: scale(8)
    },
    imgView: {
        backgroundColor: "#E6ECEF",
        width: scale(56),
        // height: 'fit-content',
        alignSelf: 'stretch',
        // backgroundColor: "#EBEFF0",
        borderRadius: scale(8),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgIcon: {
        width: scale(42),
        height: scale(42),
    },
    infoView: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing.sm
    },
    title: {
        fontWeight: theme.typography.fontWeight.medium,
        fontSize: theme.typography.fontSize.sm
    },
    text: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    }
})

export default ClassCard;