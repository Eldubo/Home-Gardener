// src/screens/RegisterScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { createAPI } from "../../services/api";
import Ionicons from 'react-native-vector-icons/Ionicons';

const GREEN = "#15A266";
const LIGHT_BG = "#EAF8EE";

export default function RegisterScreen({ navigation, baseUrl = "http://localhost:3000" }) {
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
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
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cargando..." : "Registrarme"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#CFF1E2',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  error: {
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  button: {
    marginTop: 8,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CFF1E2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    marginBottom: 18,
    height: 48,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
});
