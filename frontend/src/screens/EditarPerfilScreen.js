import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditarPerfilScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (userId) {
          const { data, error } = await supabase
            .from('Usuario')
            .select('*')
            .eq('ID', userId)
            .single();

          if (error) {
            console.error('Error al cargar usuario:', error);
            setError('No se pudo cargar la información del usuario');
          } else {
            setUserData(data);
            setNombre(data.nombre || '');
            setEmail(data.email || '');
            setDireccion(data.direccion || '');
          }
        } else {
          setError('ID de usuario no encontrado.');
        }
      } catch (err) {
        console.error('Error accediendo a AsyncStorage:', err);
        setError('Error interno al acceder al almacenamiento');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async () => {
    setError(null);

    if (!nombre.trim() || !email.trim() || !direccion.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setUpdating(true);
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        setError('No se encontró el ID de usuario.');
        return;
      }

      const { error: updateError } = await supabase
        .from('Usuario')
        .update({
          Nombre: nombre.trim(),
          Email: email.trim().toLowerCase(),
          Direccion: direccion.trim(),
        })
        .eq('ID', userId);

      if (updateError) {
        console.error('Error actualizando datos:', updateError);
        setError('No se pudo actualizar la información');
      } else {
        Alert.alert('Éxito', 'Tus datos fueron actualizados correctamente');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Error general en la actualización:', err);
      setError('Ocurrió un error inesperado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loading}>Cargando datos...</Text>
      </View>
    );
  }

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

      <Button title={updating ? 'Guardando...' : 'Guardar cambios'} onPress={handleUpdate} disabled={updating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { marginTop: 10, fontSize: 16 },
});
