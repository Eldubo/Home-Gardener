import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/Supabase';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setError(null);

    // Validaciones básicas
    if (!email || !password || !direccion) {
      setError('Email, contraseña y dirección son obligatorios');
      return;
    }

    try {
      // Insertamos directamente en la tabla public.Usuario
      const { data, error: supabaseError } = await supabase
  .from('Usuario')   // O 'usuario' según el nombre real
  .insert([
    {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword(password),
      direccion: direccion.trim()
    }
  ]);

if (supabaseError) {
  console.log('Error al insertar en Usuario:', supabaseError);
  setError(supabaseError.message);
  return;
}


      console.log('Usuario creado en tabla Usuario:', data);
      Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión');
      navigation.navigate('Login');
    } catch (e) {
      console.log('Excepción inesperada en handleRegister:', e);
      setError('Ocurrió un error inesperado');
    }
  };

  async function hashPassword(password) {
    // Convertir la contraseña en un array de bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
  
    // Usar la API de Web Crypto para generar el hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    // Convertir el buffer en un string hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
    return hashHex;
  }
  


  return (
    <View style={styles.container}>
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

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Registrarme" onPress={handleRegister} />

      <Text
        style={styles.link}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});
