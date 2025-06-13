import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Image
        source={require('../../assets/image1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 120,
    backgroundColor: '#a5d034',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 10,
  },
  logo: {
    height: 75,
    width: 100,
  },
});
