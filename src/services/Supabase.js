import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqjlakkgpogdskdxiymf.supabase.co'; // <- poné el tuyo
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxamxha2tncG9nZHNrZHhpeW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDYzOTQsImV4cCI6MjA2MzU4MjM5NH0.YaDK2KgKKohG3zAoplfKz6-cUgzeHxmZGNlu7aDTFYs'; // <- poné la tuya

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
