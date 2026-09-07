import { Animated, Dimensions } from 'react-native';
import {
  StackCardInterpolationProps,
  StackCardStyleInterpolator,
} from '@react-navigation/stack';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const slideUpTransition: StackCardStyleInterpolator = ({
  current,
  next,
}: StackCardInterpolationProps) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_HEIGHT * 0.3, 0],
          }),
        },
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1],
          }),
        },
      ],
      opacity: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.8, 1],
      }),
      borderRadius: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
      }),
    },
    overlayStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
      }),
    },
  };
};
