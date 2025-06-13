import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PlantasScreen from '../screens/PlantasScreen';
import QRScreen from '../screens/QRScreen';
import InfoScreen from '../screens/InfoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import BienvenidoScreen from '../screens/BienvenidoScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import Layout from '../components/Layout';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Bienvenido" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Bienvenido" component={BienvenidoScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      <Stack.Screen name="Home">
        {props => (
          <Layout navigation={props.navigation}>
            <HomeScreen {...props} />
          </Layout>
        )}
      </Stack.Screen>

      <Stack.Screen name="Plantas">
        {props => (
          <Layout navigation={props.navigation}>
            <PlantasScreen {...props} />
          </Layout>
        )}
      </Stack.Screen>

      <Stack.Screen name="QR">
        {props => (
          <Layout navigation={props.navigation}>
            <QRScreen {...props} />
          </Layout>
        )}
      </Stack.Screen>

      <Stack.Screen name="Info">
        {props => (
          <Layout navigation={props.navigation}>
            <InfoScreen {...props} />
          </Layout>
        )}
      </Stack.Screen>

      <Stack.Screen name="Perfil">
        {props => (
          <Layout navigation={props.navigation}>
            <PerfilScreen {...props} />
          </Layout>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
