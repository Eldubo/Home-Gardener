import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setData(data);
    alert(`Escaneado: ${data}`);
  };

  if (hasPermission === null) return <Text>Solicitando permisos...</Text>;
  if (hasPermission === false) return <Text>Acceso denegado a la cámara</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr', 'code128', 'code39', 'ean13'], // opcional
        }}
        ref={cameraRef}
      />
      {scanned && <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />}
      {data ? <Text style={styles.text}>Datos: {data}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: {
    color: 'white',
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 10,
  },
});

