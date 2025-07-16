import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import EscanerScreen from './views/EscanerScreen';

export type RootStackParamList = {
  Escaner: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const colorScheme = useColorScheme();

  // Configuración dinámica del tema
  const navigationTheme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: '#7210f3ff', // Mantenemos tu color primario
        background: colorScheme === 'dark' ? '#121212' : '#f8f9fa',
        card: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
        text: colorScheme === 'dark' ? '#ffffff' : '#000000',
        border: colorScheme === 'dark' ? '#444444' : '#e0e0e0',
      },
    };
  }, [colorScheme]);

  // Opciones de pantalla dinámicas
  const screenOptions = useMemo<StackNavigationOptions>(() => ({
    headerShown: true,
    headerTitleAlign: 'center',
    headerStyle: { 
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#000000',
    },
    headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#ffffff',
    headerTitleStyle: { 
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#ffffff',
    },
  }), [colorScheme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Escaner" screenOptions={screenOptions}>
        <Stack.Screen
          name="Escaner"
          component={EscanerScreen}
          options={{ title: 'Escáner 3D' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;