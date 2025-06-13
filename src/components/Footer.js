import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Footer({ navigation }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Plantas')}>
        <Text style={styles.link}>Plantas</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('QR')}>
        <Text style={styles.link}>QR</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Info')}>
        <Text style={styles.link}>Info</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
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
