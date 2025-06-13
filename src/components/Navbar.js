import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>Mi App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: { height: 60, backgroundColor: '#6200ee', justifyContent: 'center', paddingHorizontal: 15 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
