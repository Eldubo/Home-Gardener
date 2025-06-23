import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function BienvenidoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🌱 Bienvenido a Home Gardener, listo para emprender tu próxima aventura?
      </Text>
      <Button
      style = {styles.boton}
        title="Inicia Sesión"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
      style = {styles.boton}
        title="Registrate"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
  boton: {paddingTop: 10}
});
