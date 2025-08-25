import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlantasScreen({ navigation }) {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlantas = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de usuario');
          setLoading(false);
          return;
        }
        const response = await fetch('http://localhost:3000/api/plantas/misPlantas', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'No se pudieron obtener las plantas');
          setPlantas([]);
        } else {
          const data = await response.json();
          setPlantas(
            data.map((planta) => ({
              id: planta.ID,
              nombre: planta.Nombre,
              estado: planta.Tipo,
              imagen: planta.Foto
                ? { uri: planta.Foto }
                : require('../../assets/image1.png'),
            }))
          );
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
        setPlantas([]);
      }
      setLoading(false);
    };

    fetchPlantas();
  }, []);

  const renderPlanta = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InfoPlanta', { idPlanta: item.id })}
    >
      <Image source={item.imagen} style={styles.imagen} />
      <View style={styles.textContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.estado}>{item.estado}</Text>
      </View>
      <MaterialCommunityIcons name="arrow-right-circle-outline" size={24} color="#22A45D" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text>Cargando plantas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Plantas</Text>
      <FlatList
        data={plantas}
        renderItem={renderPlanta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text>No tienes plantas registradas.</Text>}
      />
        <TouchableOpacity
          style={styles.botonAgregarPlanta}
          onPress={() => navigation.navigate('AgregarPlanta')}
      >
        <Text style={styles.textoBoton}>Agregar planta</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botonAgregarAmbiente}
        onPress={() => navigation.navigate('AgregarAmbiente')}
      >
        <Text style={styles.textoBoton}>Agregar ambiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF0',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 10,
  },
  lista: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  imagen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  estado: {
    fontSize: 12,
    color: '#888888',
  },
  botonAgregarPlanta: {
    backgroundColor: '#22A45D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  botonAgregarAmbiente: {
    backgroundColor: '#1E8449',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0',
  },
});
