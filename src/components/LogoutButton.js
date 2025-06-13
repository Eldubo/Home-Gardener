import React from 'react';
import { Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return <Button title="Cerrar sesión" onPress={handleLogout} />;
}
