// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../services/Supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Registro exitoso', 'Revisá tu correo para confirmar.');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12, borderWidth: 1, padding: 10, borderRadius: 4 },
});
