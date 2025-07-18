// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Bienvenido');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/image1.png')} style={styles.logo} />
      <Text style={styles.title}>Home Gardener</Text>
      <Text style={styles.slogan}>Watch them grow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  slogan: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#4caf50',
    marginTop: 5,
  },
});
