import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function InfoPlanta({ route }) {
  const { idPlanta } = route.params;
  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfoPlanta = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de usuario');
          setLoading(false);
          return;
        }
        const response = await fetch(`${baseUrl}/api/plantas/getInfoPlanta?idPlanta=${idPlanta}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'No se pudo obtener la información de la planta');
          setPlanta(null);
        } else {
          const data = await response.json();
          setPlanta(data);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
        setPlanta(null);
      }
      setLoading(false);
    };

    fetchInfoPlanta();
  }, [idPlanta]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  if (!planta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró información de la planta.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{planta.nombre}</Text>
      <Image
        source={
          planta.foto
            ? { uri: planta.foto }
            : require('../../assets/image1.png')
        }
        style={styles.imagen}
      />
      <Text style={styles.label}>Tipo:</Text>
      <Text style={styles.valor}>{planta.tipo}</Text>
      <Text style={styles.label}>Ambiente:</Text>
      <Text style={styles.valor}>{planta.ambiente}</Text>
      <Text style={styles.label}>ID Planta:</Text>
      <Text style={styles.valor}>{planta.idPlanta}</Text>
      {planta.idModulo && (
        <>
          <Text style={styles.label}>ID Módulo:</Text>
          <Text style={styles.valor}>{planta.idModulo}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF0',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22A45D',
    marginBottom: 16,
    textAlign: 'center',
  },
  imagen: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D9D9D9',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginTop: 10,
  },
  valor: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    },
});