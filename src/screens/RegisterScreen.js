import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/Supabase';
import SHA256 from 'crypto-js/sha256';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateInputs = () => {
    const trimmedEmail = email.trim();
    const trimmedDireccion = direccion.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!trimmedEmail || !password || !trimmedDireccion) {
      return 'Email, contraseña y dirección son obligatorios';
    }
    if (!emailRegex.test(trimmedEmail)) {
      return 'Ingresa un email válido';
    }
    if (!passwordRegex.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
    }
    return null;
  };

  const handleRegister = async () => {
    setError('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const hashedPassword = SHA256(password).toString();

      const { error: supabaseError } = await supabase.from('Usuario').insert([
        {
          Nombre: nombre.trim() || null,
          Email: email.trim().toLowerCase(),
          Password: hashedPassword,
          Direccion: direccion.trim(),
        },
      ]);

      if (supabaseError) {
        console.error('Error al insertar usuario:', supabaseError);
        setError(supabaseError.message || 'No se pudo registrar el usuario');
        return;
      }

      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada correctamente');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Crear cuenta</Text>

        <TextInput
          placeholder="Nombre (opcional)"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

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
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Dirección"
          value={direccion}
          onChangeText={setDireccion}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8e9',
  },
  scrollContainer: {
    padding: 60,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
  },
  icon: {
    padding: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#388e3c',
    textAlign: 'center',
    fontSize: 16,
  },
});