import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error en el login');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      Alert.alert('Bienvenido', `Hola, ${data.user.nombre || 'usuario'}!`);
      navigation.navigate('Home');
    } catch (e) {
      setError('Error al conectar con el servidor');
      console.log(e)
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
});
