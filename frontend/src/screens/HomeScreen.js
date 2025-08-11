import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Token inválido o expirado');

        const data = await res.json();
        setUserData(data.user || data);
      } catch (e) {
        console.log('Error al cargar perfil:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Text style={styles.loading}>Cargando...</Text>;

  if (!userData) return <Text style={styles.error}>No hay datos de usuario</Text>;

  return (
<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerWrap}>
        <ImageBackground
          style={styles.headerImage}
          imageStyle={styles.headerImageRadius}
          source={{
            uri: "",
          }}
        >
          <View style={styles.headerOverlay} />
        </ImageBackground>

        <View style={styles.logoCircle}>
          <Image
            source={{
              uri: "",
            }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.greetingBox}>
        <Text style={styles.greetingText}>Bienvenido/a a Home</Text>
        <Text style={styles.greetingText}>Gardener</Text>
        <Text style={styles.greetingName}>{userName}</Text>
      </View>
      <View style={styles.list}>
        {PLANTS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text
                style={[
                  styles.cardNote,
                  p.status === "ok" && { color: "#6c757d" },
                  p.status === "warn" && { color: "#d39e00" },
                  p.status === "alert" && { color: "#e35d6a" },
                ]}
                numberOfLines={2}
              >
                {p.note}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusColor[p.status] }]} />
          </View>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => navigation.navigate('ChatBot')}
      >
        <Text style={styles.botonText}></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loading: { textAlign: 'center', marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
  title: { fontSize: 24, marginBottom: 15 },
});
