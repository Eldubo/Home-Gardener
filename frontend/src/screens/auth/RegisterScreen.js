// src/screens/RegisterScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { createAPI } from "../../services/api";

export default function RegisterScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL}) {
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) =>
    pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);

  const validateEmail = (mail) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!email || !password || !direccion) {
      setError("Email, contraseña y dirección son obligatorios");
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("Formato de email inválido");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una letra y un número");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/api/auth/register", {
        nombre,
        email,
        password,
        direccion,
      });
      Alert.alert("Registro exitoso", data?.message || "Ya puedes iniciar sesión");
      navigation.navigate("Login");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Error en el registro"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre (opcional)"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title={loading ? "Cargando..." : "Registrarme"}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  input: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  error: { color: "red", marginBottom: 10 },
});
