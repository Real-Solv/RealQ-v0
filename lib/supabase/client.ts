import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// 🔹 Lê as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🔹 Garante que as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Variáveis de ambiente do Supabase não configuradas corretamente."
  );
}

// 🔹 Cria o cliente tipado com seu schema do banco
// 🚫 Desativa a persistência automática da sessão e o auto refresh
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true, // ✅ Mantém o usuário logado mesmo após reload
      autoRefreshToken: true, // ✅ Atualiza o token automaticamente quando expira
      detectSessionInUrl: true, // ✅ Necessário para OAuth / redirecionamentos
      storageKey: "supabase.auth.token", // (opcional) chave consistente no localStorage
    },
  }
);

// 🔹 Compatibilidade retroativa com imports antigos
export const supabase = supabaseClient;

// 🔹 Função auxiliar para obter o cliente
export function getSupabaseClient() {
  return supabaseClient;
}

// 🔹 Export default para importação direta
export default supabaseClient;

// 🔹 Export opcional da função createClient (caso use em outros lugares)
export { createClient };
