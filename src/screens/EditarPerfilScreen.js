import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/Supabase';

export default function EditarPerfilScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .eq('ID', userId)
          .single();

        if (error) {
          console.log('Error al cargar usuario:', error);
        } else {
          setUserData(data);
          setNombre(data.nombre || '');
          setEmail(data.email || '');
          setDireccion(data.direccion || '');
        }
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async () => {
    setError(null);

    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    const { error: updateError } = await supabase
      .from('Usuario')
      .update({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
      })
      .eq('ID', userId);

    if (updateError) {
      console.log('Error actualizando datos:', updateError);
      setError('No se pudo actualizar la información');
    } else {
      Alert.alert('Éxito', 'Tus datos fueron actualizados correctamente');
      navigation.goBack();
    }
  };

  if (!userData) return <Text style={styles.loading}>Cargando datos...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Guardar cambios" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 12, padding: 10, borderWidth: 1, borderRadius: 4 },
  error: { color: 'red', marginBottom: 10 },
  loading: { marginTop: 20, textAlign: 'center' },
});
