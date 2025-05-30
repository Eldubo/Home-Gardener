// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/Supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleRegister = async () => {
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error al registrar', error.message);
      return;
    }

    const user = data?.user;

    if (!user) {
      Alert.alert('Error', 'No se pudo obtener el usuario.');
      return;
    }

    // 2. Insertar datos adicionales en la tabla Usuario
    const { error: insertError } = await supabase.from('Usuario').insert([
      {
        ID: user.id, // usamos el ID generado por Auth como clave primaria
        Nombre: nombre,
        Mail: email,
        Direccion: direccion,
        Contraseña: password, // ⚠️ En producción deberías cifrarla, o no guardarla si ya usás Auth
      },
    ]);

    if (insertError) {
      Alert.alert('Error al guardar datos', insertError.message);
      return;
    }

    Alert.alert('Registro exitoso', 'Revisá tu correo para confirmar tu cuenta.');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Dirección" value={direccion} onChangeText={setDireccion} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
  },
});
