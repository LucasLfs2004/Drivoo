import { scale } from '@/utils';
import { StyleProp, ViewStyle } from 'react-native';

export const tabBarItemStyle: StyleProp<ViewStyle> = {
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(56),
    display: 'flex',
};

export const tabBarStyle: ViewStyle = {
    position: 'absolute',
    width: scale(380),
    bottom: scale(24),
    marginLeft: scale(30),
    borderRadius: scale(64),
    height: scale(58),
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',

    //   shadowColor: theme.colors.,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
};
