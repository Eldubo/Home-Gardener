import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAPI } from "../services/api";
import LogoutButton from "../components/LogoutButton";

export default function PerfilScreen({ navigation, baseUrl = "http://localhost:3000" }) {
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data.user); // acá viene con Nombre, Email, Direccion
      } catch (e) {
        console.log("Error cargando perfil:", e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [api]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay datos de usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            user.Imagen ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={styles.imagen}
      />

      <Text style={styles.title}>Tu perfil</Text>

      <Text style={styles.subtitle}>Datos personales</Text>
      <Text style={styles.text}>Nombre: {user.Nombre}</Text>
      <Text style={styles.text}>Email: {user.Email}</Text>
      <Text style={styles.text}>Dirección: {user.Direccion}</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("EditarPerfil")}
      >
        <Text style={styles.botonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <LogoutButton navigation={navigation} />

      <View style={{ marginTop: 30, alignItems: "center" }}>
        <Text style={styles.title}>Sistema de riego</Text>
        <Text style={styles.subtitle}>¿Quiere un sistema de riego?</Text>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.botonText}>Conoce más</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.botonText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 10, fontWeight: "bold" },
  subtitle: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 6 },
  imagen: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  boton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#15A266",
    alignItems: "center",
    width: 200,
  },
  botonText: { color: "#fff", fontWeight: "bold" },
});
