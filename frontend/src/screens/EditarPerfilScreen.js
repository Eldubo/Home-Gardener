import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function EditarPerfilScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);
  const { user, updateUser } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      setError(null);
      try {
        // Si ya tenemos el usuario en contexto, lo usamos; si no, pedimos al backend
        if (user) {
          setNombre(user.Nombre || '');
          setEmail(user.Email || '');
          setDireccion(user.Direccion || '');
          setLoading(false);
          return;
        }

        const { data } = await api.get('/api/auth/profile');
        const u = data?.user;
        setNombre(u?.Nombre || '');
        setEmail(u?.Email || '');
        setDireccion(u?.Direccion || '');
      } catch (e) {
        setError(e?.response?.data?.message || 'No se pudo cargar la información del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [api, user]);

  const handleUpdate = async () => {
    setError(null);

    if (!nombre.trim() || !email.trim() || !direccion.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setUpdating(true);
      const { data } = await api.put('/api/auth/profile', {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
      });

      const updated = data?.user;
      if (updated) {
        await updateUser(updated);
        Alert.alert('Éxito', 'Tus datos fueron actualizados correctamente');
        navigation.goBack();
      } else {
        setError('No se pudo actualizar la información');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Ocurrió un error inesperado';
      setError(msg);
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
