// src/screens/RegisterScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { createAPI } from "../../services/api";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "#15A266";
const DARK_GREEN = "#0D5C3C";
const LIGHT_BG = "#EAF8EE";

export default function RegisterScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL}) {
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

  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHT_BG }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Card */}
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Registrarme</Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              <TextInput
                placeholder="Nombre (opcional)"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                placeholderTextColor="#777"
              />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#777"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#777"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Dirección"
                value={direccion}
                onChangeText={setDireccion}
                style={styles.input}
                placeholderTextColor="#777"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  card: {
    height: height * 0.6, // 60% de la pantalla
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: GREEN,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,

    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  form: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#fff",
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#1a1a1a",
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 14,
    height: 48,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#1a1a1a",
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  error: {
    color: "#fff",
    backgroundColor: "#D32F2F",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    textAlign: "center",
    fontSize: 15,
  },
  footer: {
    marginTop: 10,
  },
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_GREEN,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
});
