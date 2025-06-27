import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity
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
      let hashedPassword = SHA256(password).toString();
  
      const { data, error: queryError } = await supabase
        .from('Usuario')
        .select('*')
        .eq('Email', email.trim().toLowerCase())
        .eq('Password', hashedPassword)
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
      Alert.alert('Bienvenido', `Hola, ${data.Nombre || 'usuario'}!`);
      navigation.navigate('Home');
  
    } catch (e) {
      console.log('Excepción inesperada en handleLogin:', e);
      setError('Ocurrió un error inesperado');
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Iniciar sesión</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotContainer}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.forgotContainer}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.forgot}>Registrate gratuitamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f1f8e9',  // Fondo suave
    padding: 20,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#4caf50',  // Color verde de la marca
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
  error: { 
    color: 'red', 
    marginBottom: 10, 
    fontSize: 14,
  },
  button: { 
    backgroundColor: '#388e3c',  // Verde oscuro para el botón
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,  // Limitar el ancho del botón
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
  },
  forgotContainer: { 
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  forgot: { 
    color: '#388e3c', 
    fontSize: 16, 
    textAlign: 'center',
  }
});
