import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';

export default function BienvenidoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🌱 Bienvenido a Home Gardener, listo para emprender tu próxima aventura?
      </Text>
      
      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.botonText}>Inicia Sesión</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.botonText}>Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f1f8e9',  // Fondo suave
    padding: 20,
  },
  text: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4caf50',  // Color verde más amigable
    textAlign: 'center', 
    marginBottom: 30,
  },
  boton: { 
    backgroundColor: '#388e3c',  // Verde más oscuro para botones
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,  // Limitar el ancho para que no se vean demasiado grandes
  },
  botonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
  }
});
