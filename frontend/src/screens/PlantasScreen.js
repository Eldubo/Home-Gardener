import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';
export default function PlantasScreen() {
  const renderplantas = ({ plantas }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetallePlanta', { id: plantas.id })}>
      <Image source={imagen} style={styles.imagen} />
      <View style={styles.textContainer}>
        <Text style={styles.nombre}>{plantas.nombre}</Text>
        <Text style={styles.estado}>{plantas.estado}</Text>
      </View>
      <Ionicons name="arrow-forward-circle-outline" size={24} color="#22A45D" />
    </TouchableOpacity>
     );
  return (
    <View style={styles.separatorBottom}>
      <View style={styles.container}>
      <Text style={styles.titulo}>Mis Plantas</Text>
      <FlatList
        data={plantas}
        renderplantas={renderplantas}
        keyExtractor={(plantas) => plantas.id.toString()}
        contentContainerStyle={styles.lista}
      />
      <TouchableOpacity style={styles.botonAgregar} onPress={() => navigation.navigate('AgregarPlanta')}>
        <Text style={styles.textoBoton}>Agregar planta</Text>
      </TouchableOpacity>
      </View>
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
  separatorTop: {
    borderTopWidth: 1,
    borderColor: '#A4D4B4',
    marginVertical: 10,
  },
  separatorBottom: {
    borderBottomWidth: 1,
    borderColor: '#A4D4B4',
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
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
  botonAgregar: {
    backgroundColor: '#22A45D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
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