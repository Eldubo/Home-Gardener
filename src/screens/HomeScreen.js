import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/Supabase';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);

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
        }
      }
    };

    loadUser();
  }, []);

  if (!userData)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido, {userData.Nombre || "Usuario"}</Text>
      {/* muestra otras características */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
});
