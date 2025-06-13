import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from './Footer';

export default function Layout({ children, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
