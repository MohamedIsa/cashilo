import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = { onDone: () => void };

export default function AnimatedSplash({ onDone }: Props) {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(8);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 280 });

    textOpacity.value = withDelay(320, withTiming(1, { duration: 320 }));
    textY.value = withDelay(320, withTiming(0, { duration: 320 }));

    containerOpacity.value = withDelay(
      1700,
      withTiming(0, { duration: 450 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[styles.wordmark, textStyle]}>cashilo</Animated.Text>
      <Animated.View style={[styles.dotRow, textStyle]}>
        <View style={[styles.dot, { backgroundColor: '#00B8D9' }]} />
        <View style={[styles.dot, { backgroundColor: '#00B8D9', opacity: 0.5 }]} />
        <View style={[styles.dot, { backgroundColor: '#00B8D9', opacity: 0.25 }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 27,
  },
  wordmark: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: '700',
    color: '#00B8D9',
    letterSpacing: -0.5,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
