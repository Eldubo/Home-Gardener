// src/screens/LoginScreen.js
import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAPI } from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({ navigation, baseUrl = "http://localhost:3000" }) {
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const { data } = await api.post('/api/auth/login', { email, password });
      await AsyncStorage.setItem('token', data.token);

      Alert.alert('Bienvenido', `Hola, ${data.user?.nombre || 'usuario'}!`);
      navigation.navigate('Home');
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e.message ||
        'Error en el login';
      setError(msg);
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
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    backgroundColor: '#F0FFF0',
  },
  input: {
    marginBottom: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#333',
    fontSize: 18,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  error: {
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});
