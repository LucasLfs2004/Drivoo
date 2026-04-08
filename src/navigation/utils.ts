import theme from '@/theme';
import { scale } from '@/utils';
import { StyleProp, ViewStyle } from 'react-native';

export const tabBarItemStyle: StyleProp<ViewStyle> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(56),
    // width: scale(20),
    paddingHorizontal: theme.spacing.xs,
};

export const tabBarStyle: ViewStyle = {
    position: 'absolute',
    width: scale(400),
    bottom: scale(32),
    marginLeft: scale(20),
    borderRadius: scale(64),
    height: scale(58),
    // display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',

    //   shadowColor: theme.colors.,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
};
