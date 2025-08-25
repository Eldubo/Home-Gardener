import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  SplashScreen, 
  LoginScreen,
  RegisterScreen, 
  HomeScreen, 
  PlantasScreen, 
  AgregarPlanta, 
  AgregarAmbiente,
  QRScreen,
  InfoScreen, 
  PerfilScreen, 
  BienvenidoScreen, 
  ForgotPasswordScreen, 
  EditarPerfilScreen,
  InfoPlantaScreen,
  ChatbotScreen,
} from '../screens'

import Layout from '../components/Layout';  
import withLayout from '../utils/withLayout';  // Importa el HOC

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Bienvenido" component={BienvenidoScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      
      {/* Usamos el HOC withLayout para envolver estas pantallas */}
      <Stack.Screen name="Chatbot" component={withLayout(ChatbotScreen)} />
      <Stack.Screen name="Home" component={withLayout(HomeScreen)} />
      <Stack.Screen name="Plantas" component={withLayout(PlantasScreen)} />
      <Stack.Screen name="AgregarPlanta" component={withLayout(AgregarPlanta)} />
      <Stack.Screen name="AgregarAmbiente" component={withLayout(AgregarAmbiente)} />
      <Stack.Screen name="QR" component={withLayout(QRScreen)} />
      <Stack.Screen name="Info" component={withLayout(InfoScreen)} />
      <Stack.Screen name="Perfil" component={withLayout(PerfilScreen)} />
      <Stack.Screen name="EditarPerfil" component={withLayout(EditarPerfilScreen)} />
      <Stack.Screen name="InfoPlanta" component={withLayout(InfoPlantaScreen)} />
    </Stack.Navigator>
  );
}
