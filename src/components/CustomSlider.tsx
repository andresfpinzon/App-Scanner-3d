import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { red700 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_PADDING = 31; // Reducido para mejor ajuste
const THUMB_SIZE = 34;

interface Props {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
}

const CustomSlider: React.FC<Props> = ({
  title,
  value,
  min,
  max,
  onChange,
  unit = '',
  step = 1,
}) => {
  const sliderPos = useSharedValue(value);
  const isSliding = useSharedValue(false);
  const sliderWidth = SCREEN_WIDTH - SLIDER_PADDING * 4; // Ajuste del ancho

  useEffect(() => {
    if (!isSliding.value) {
      sliderPos.value = withSpring(value, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [value]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isSliding.value = true;
    })
    .onUpdate((e) => {
      const newValue = interpolate(
        e.absoluteX - SLIDER_PADDING,
        [0, sliderWidth],
        [min, max],
        'clamp'
      );
      sliderPos.value = newValue;
      runOnJS(onChange)(Math.round(newValue / step) * step);
    })
    .onEnd(() => {
      isSliding.value = false;
      sliderPos.value = withSpring(
        Math.round(sliderPos.value / step) * step,
        { damping: 15, stiffness: 100 }
      );
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(
        sliderPos.value,
        [min, max],
        [0, sliderWidth - THUMB_SIZE]
      )
    }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    width: interpolate(
      sliderPos.value,
      [min, max],
      [0, sliderWidth]
    ),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      
      <View style={styles.sliderContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.trackBackground}>
            <Animated.View style={[styles.trackActive, trackStyle]} />
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>
      </View>

      <Text style={styles.value}>
        {Math.round(value / step) * step} {unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
    paddingHorizontal: SLIDER_PADDING,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sliderContainer: {
    width: '100%',
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#d3d3d3',
    borderRadius: 2,
    position: 'relative',
  },
  trackActive: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE/2,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    top: -THUMB_SIZE/2 + 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  value: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default CustomSlider;
