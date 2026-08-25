import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso aparece no console do navegador (F12) se as variáveis não estiverem
  // configuradas na Vercel (Settings → Environment Variables).
  console.warn(
    "[EcoCheck] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas. " +
    "Login, cadastro e dados salvos não vão funcionar até isso ser corrigido."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
