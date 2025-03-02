import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mieyaugtlnxpcjvuerud.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZXlhdWd0bG54cGNqdnVlcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODg4MTQsImV4cCI6MjA1NjQ2NDgxNH0.CuUMSFPnrAyqhQtP3xp_nK4tT9QcW4GaLF-QaztcLkk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
