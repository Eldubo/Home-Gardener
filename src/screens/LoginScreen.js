import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert
} from 'react-native';
import { supabase } from '../lib/Supabase';
import SHA256 from 'crypto-js/sha256';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);

    try {
      // Generar el hash con crypto-js
      const hashedPassword = SHA256(password).toString();

      // Llamar a Supabase (rename del error para no colisionar con el state)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: hashedPassword
      });

      if (authError) {
        console.log('Error en login:', authError);
        setError(authError.message);
      } else {
        console.log('Login exitoso:', data);
        Alert.alert('Login exitoso', '¡Has iniciado sesión correctamente!');
        navigation.navigate('HomeScreen');
      }
    } catch (e) {
      console.log('Excepción inesperada en handleLogin:', e);
      setError('Ocurrió un error inesperado al generar el hash o contactar a Supabase');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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

      <Button title="Iniciar sesión" onPress={handleLogin} />

      <Text
        style={styles.forgot}
        onPress={() => {
          /* lógica para recuperar contraseña */
        }}
      >
        Olvidaste tu contraseña?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
  forgot: { marginTop: 12, color: 'blue', textAlign: 'center' }
});
