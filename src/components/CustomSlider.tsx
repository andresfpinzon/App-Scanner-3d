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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_PADDING = 30;
const THUMB_SIZE = 28;

interface Props {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  thumbColor?: string;
  minTrackColor?: string;
  maxTrackColor?: string;
  textColor?: string;
}

const CustomSlider: React.FC<Props> = ({
  title,
  value,
  min,
  max,
  onChange,
  unit = '',
  step = 1,
  thumbColor = '#4CAF50',
  minTrackColor = '#4CAF50',
  maxTrackColor = '#d3d3d3',
  textColor = '#333',
}) => {
  const sliderPos = useSharedValue(value);
  const isSliding = useSharedValue(false);
  const sliderWidth = SCREEN_WIDTH - SLIDER_PADDING * 4;

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
    backgroundColor: thumbColor,
  }));

  const trackStyle = useAnimatedStyle(() => ({
    width: interpolate(
      sliderPos.value,
      [min, max],
      [0, sliderWidth]
    ),
    backgroundColor: minTrackColor,
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      
      <View style={styles.sliderContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={[styles.trackBackground, { backgroundColor: maxTrackColor }]}>
            <Animated.View style={[styles.trackActive, trackStyle]} />
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>
      </View>

      <Text style={[styles.value, { color: textColor }]}>
        {Math.round(value / step) * step} {unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: SLIDER_PADDING,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sliderContainer: {
    width: '100%',
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    position: 'relative',
  },
  trackActive: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE/2,
    position: 'absolute',
    top: -THUMB_SIZE/2 + 3,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CustomSlider;