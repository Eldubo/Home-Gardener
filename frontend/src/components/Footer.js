import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
export default function Footer({ navigation }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" color="#000" size={5} />
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Plantas')}>
        <Ionicons name="leaf-outline" color="#000" size={5} />
        <Text style={styles.link}>Plantas</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('QR')}>
        <Ionicons name="qr-code" color="#000" size={5} />
        <Text style={styles.link}>QR</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Info')}>
        <Feather nname="book" color="#000" size={5}></Feather>
        <Text style={styles.link}>Info</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
      <Feather name="user" color="#000" size={5} />
        <Text style={styles.link}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
  },
});
