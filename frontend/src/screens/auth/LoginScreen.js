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
          style={styles.passwordInput}
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

const GREEN = "#15A266";
const LIGHT_BG = "#EAF8EE";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#CFF1E2',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CFF1E2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    marginBottom: 18,
    height: 48,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  error: {
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  button: {
    marginTop: 8,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
});