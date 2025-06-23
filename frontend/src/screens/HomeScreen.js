import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Token inválido o expirado');

        const data = await res.json();
        setUserData(data);
      } catch (e) {
        console.log('Error al cargar perfil:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Text style={styles.loading}>Cargando...</Text>;

  if (!userData) return <Text style={styles.error}>No hay datos de usuario</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {userData.nombre || 'usuario'}</Text>
      <Text>Email: {userData.email}</Text>
      <Text>Dirección: {userData.direccion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loading: { textAlign: 'center', marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
  title: { fontSize: 24, marginBottom: 15 },
});
