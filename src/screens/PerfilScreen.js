import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/Supabase';
import LogoutButton from '../components/LogoutButton';

export default function PerfilScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .eq('ID', userId)
          .single();
        if (!error) setUser(data);
      }
    };

    cargarUsuario();
  }, []);

  if (!user) return <Text style={styles.loading}>Cargando perfil...</Text>;

  return (
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  label: { fontSize: 16, marginBottom: 8 },
  loading: { flex: 1, textAlign: 'center', textAlignVertical: 'center' }
});
