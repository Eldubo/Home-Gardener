import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.manifest?.extra?.supabaseUrl || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.manifest?.extra?.supabaseAnonKey || Constants.expoConfig?.extra?.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
