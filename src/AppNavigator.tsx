import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import EscanerScreen from './views/EscanerScreen';

export type RootStackParamList = {
  Escaner: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitleAlign: 'center',
  headerStyle: { backgroundColor: '#7210f3ff' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
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

