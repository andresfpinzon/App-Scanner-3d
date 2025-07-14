import React from 'react';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    
    <PaperProvider>
      <ThemeProvider>
      <AppNavigator />
  </ThemeProvider>

    </PaperProvider>
  );
}

