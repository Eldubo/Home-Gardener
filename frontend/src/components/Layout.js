import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout({ children, navigation }) {
  return (
    <View style={styles.container}>
      <Navbar style={styles.navbar} />
      <View style={styles.content}>{children}</View>
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { height: 60 },
  content: { flex: 1 },
});
