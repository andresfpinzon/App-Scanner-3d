import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface Props {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const CustomSlider: React.FC<Props> = ({ title, value, min, max, onChange, unit = '' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      <Slider
        style={{ width: '100%' }}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#4CAF50"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#4CAF50"
      />
      <Text style={styles.value}>{Math.round(value)} {unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  label: { fontSize: 16, fontWeight: '600' },
  value: { fontSize: 14, color: '#555' }
});