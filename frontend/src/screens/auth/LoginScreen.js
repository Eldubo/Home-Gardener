// src/screens/LoginScreen.js
import React, { useState, useMemo } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAPI } from '../../services/api';

export default function LoginScreen({ navigation, baseUrl = "http://localhost:3000" }) {
  // Instancia de API (se recrea si cambia baseUrl)
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  const validatePassword = (pwd) =>
    pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Formato de email inválido');
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra y un número');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        // guardar token
        await AsyncStorage.setItem('token', response.data.token);

        Alert.alert('Bienvenido', `Hola, ${response.data.user?.nombre || 'usuario'}!`);
        navigation.navigate('Home');
      } else {
        throw new Error('Respuesta del servidor inválida: no se recibió token');
      }
    } catch (e) {
      let errorMessage = 'Error en el login';
      
      if (e.response) {
        // El servidor respondió con un código de error
        errorMessage = e.response.data?.message || 
                      e.response.data?.error || 
                      `Error del servidor: ${e.response.status}`;
      } else if (e.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        // Algo pasó al configurar la solicitud
        errorMessage = e.message || 'Error desconocido al realizar la solicitud';
      }
      
      setError(errorMessage);
      console.log('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={loading ? 'Cargando...' : 'Iniciar sesión'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
});
