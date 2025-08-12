import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    
    if (!email || !password || !direccion) {
      setError('Email, contraseña y dirección son obligatorios');
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
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, direccion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Error en el registro');
        return;
      }

      Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión');
      navigation.navigate('Login');
    } catch (e) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nombre (opcional)" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Dirección" value={direccion} onChangeText={setDireccion} style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? "Cargando..." : "Registrarme"} onPress={handleRegister} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
});
