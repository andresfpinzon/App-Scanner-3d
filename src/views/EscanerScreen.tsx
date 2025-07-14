// components/CustomSlider.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface CustomSliderProps {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit: string;
  step: number;
  thumbColor: string;
  minTrackColor: string;
  maxTrackColor: string;
  textColor: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  title,
  value,
  min,
  max,
  onChange,
  unit,
  step,
  thumbColor,
  minTrackColor,
  maxTrackColor,
  textColor
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {title}: <Text style={styles.value}>{value}{unit}</Text>
      </Text>
      <View style={styles.sliderContainer}>
        <Text style={[styles.minMax, { color: textColor }]}>{min}{unit}</Text>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={minTrackColor}
          maximumTrackTintColor={maxTrackColor}
          thumbTintColor={thumbColor}
        />
        <Text style={[styles.minMax, { color: textColor }]}>{max}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  minMax: {
    fontSize: 14,
    minWidth: 40,
    textAlign: 'center',
  },
});

export default CustomSlider;