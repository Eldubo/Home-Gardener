import axios from "axios";

export const createAPI = (baseURL, { timeout = 8000 } = {}) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
  });

  // Interceptor para agregar el token de autorización
  instance.interceptors.request.use(
    (config) => {
      // Aquí podrías agregar el token desde AsyncStorage si es necesario
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar respuestas y errores
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Manejar errores específicos
      if (error.response?.status === 401) {
        // Token expirado o inválido
        console.log('Token expirado o inválido');
        // Aquí podrías redirigir al login
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Función helper para obtener la URL base de la API
export const getApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
};
