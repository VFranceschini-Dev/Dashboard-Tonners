import { createClient } from '@supabase/supabase-js';

// Configuración real de tu proyecto de Supabase
const supabaseUrl = 'https://supabase.co';

// NOTA: Asegúrate de que esta clave larga sea exactamente la que copiaste de la sección "API Keys" de Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocmVrdmNtYWZjZHBhcHRmeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyMTg2MjYsImV4cCI6MjAyNjc5NDYyNn0.abc'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
