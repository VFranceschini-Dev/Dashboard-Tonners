import { createClient } from '@supabase/supabase-js';

// Configuración real de tu proyecto de Supabase
const supabaseUrl = 'https://rhrekvcmafcdpaptfypt.supabase.co';

// NOTA: Asegúrate de que esta clave larga sea exactamente la que copiaste de la sección "API Keys" de Supabase
const supabaseAnonKey = 'sb_publishable_gLTIdMPhR9O8XFL6EKKoyQ_BcKtCreF'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
