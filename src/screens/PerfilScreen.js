import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/Supabase';
import LogoutButton from '../components/LogoutButton';

export default function PerfilScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (userId) {
          const { data, error } = await supabase
            .from('Usuario')
            .select('*')
            .eq('ID', userId)
            .single();

          if (error) {
            console.error('Error al cargar usuario:', error.message);
          } else {
            setUser(data);
          }
        }
      } catch (err) {
        console.error('Error al acceder a AsyncStorage:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loading}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>No se encontró el perfil del usuario.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Tu perfil</Text>
        <Text style={styles.label}>Nombre: {user.nombre}</Text>
        <Text style={styles.label}>Email: {user.email}</Text>
        <Text style={styles.label}>Dirección: {user.direccion}</Text>

        <Button title="Editar perfil" onPress={() => navigation.navigate('EditarPerfil')} />

        <View style={{ marginTop: 20 }}>
          <LogoutButton navigation={navigation} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  label: { fontSize: 16, marginBottom: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loading: { fontSize: 16, marginTop: 10 },
});
