import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import LogoutButton from '../components/LogoutButton';

export default function PerfilScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={item.imagen} style={styles.imagen} />
      <Text style={styles.title}>Tu perfil</Text>
      <View style={styles.container}>
        <Text style={styles.title}>Datos personales </Text>
        <Text style={styles.text}>{user.nombre}</Text>
        <Text style={styles.text}>{user.mail}</Text>
      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => navigation.navigate('EditarPerfil')}
      ></TouchableOpacity>
      <LogoutButton navigation={navigation} />
    </View>
    <View style={styles.container}>
    <Text style={styles.title}>Sistema de riego</Text>
    <Text style={styles.subtitle}>¿Quiere un sistema de riego?</Text>
    <TouchableOpacity 
        style={styles.boton} 
      >Conoce más</TouchableOpacity>
    <TouchableOpacity 
        style={styles.boton} 
      >Comprar</TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
});
