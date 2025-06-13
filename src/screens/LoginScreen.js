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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
  
    try {
      const hashedPassword = SHA256(password).toString();
  
      const { data, error: queryError } = await supabase
  .from('Usuario')
  .select('*')
  .eq('email', email.trim().toLowerCase())
  .eq('password', hashedPassword)
  .single();

console.log('Usuario obtenido:', data);

if (queryError || !data) {
  setError('Email o contraseña incorrectos');
  return;
}

const userId = data.ID;

if (!userId) {
  console.log('No se encontró el id del usuario:', data);
  setError('Error interno: no se encontró el id del usuario.');
  return;
}

try {
  await AsyncStorage.setItem('user_id', userId.toString());
} catch (storageError) {
  console.log('Error guardando user_id en AsyncStorage:', storageError);
}

  
      setPassword('');
      Alert.alert('Bienvenido', `Hola, ${data.nombre || 'usuario'}!`);
      navigation.navigate('Home');
  
    } catch (e) {
      console.log('Excepción inesperada en handleLogin:', e);
      setError('Ocurrió un error inesperado');
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
          navigation.navigate("ForgotPassword")
        }}
      > ¿Olvidaste tu contraseña?
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
