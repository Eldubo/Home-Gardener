import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  };

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
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Error en el login');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      Alert.alert('Bienvenido', `Hola, ${data.user.nombre || 'usuario'}!`);
      navigation.navigate('Home');
    } catch (e) {
      setError('Error al conectar con el servidor');
      console.log(e)
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? "Cargando..." : "Iniciar sesión"} onPress={handleLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
});
