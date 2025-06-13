import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/Supabase';
import SHA256 from 'crypto-js/sha256';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!email || !password || !direccion) {
      setError('Email, contraseña y dirección son obligatorios');
      return;
    }

    try {
      const hashedPassword = SHA256(password).toString();

      const { data, error: supabaseError } = await supabase
        .from('Usuario')
        .insert([
          {
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            direccion: direccion.trim(),
          },
        ]);

      if (supabaseError) {
        console.log('Error al insertar en Usuario:', supabaseError);
        setError(supabaseError.message);
        return;
      }

      Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión');
      navigation.navigate('Login');
    } catch (e) {
      console.log('Excepción inesperada en handleRegister:', e);
      setError('Ocurrió un error inesperado');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nombre (opcional)" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
          <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TextInput placeholder="Dirección" value={direccion} onChangeText={setDireccion} style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Registrarme" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingRight: 8,
  },
  icon: {
    padding: 4,
  },
});
