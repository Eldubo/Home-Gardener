import 'dotenv/config';

export default {
  expo: {
    name: 'Home-Gardener',
    slug: 'home-gardener',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/image1.png',
    splash: {
      image: './assets/image1.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      supabaseUrl: process.env.EXPO_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_SUPABASE_ANON_KEY,
    },
    plugins: [
      'expo-secure-store'
    ]
  },
};
