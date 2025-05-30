import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig.extra;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
