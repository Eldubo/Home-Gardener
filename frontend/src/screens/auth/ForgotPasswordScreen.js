import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      Alert.alert(
        'Correo enviado',
        'Revisá tu email para cambiar la contraseña.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Enviando...' : 'Enviar correo'} onPress={handleResetPassword} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 20,
    justifyContent:'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2e7d32',
  },
  input: {
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:5,
    padding:10,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  }
});
