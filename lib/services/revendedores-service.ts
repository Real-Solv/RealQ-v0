// lib/services/revendedores.ts
import { supabaseClient } from "@/lib/supabase/client"

export type Revendedor = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  cidade: string | null
  created_at: string | null
}

export async function getRevendedorById(id: string): Promise<Revendedor> {
  const { data, error } = await supabaseClient
    .from("revendedores")
    .select("*")
    .eq("id", id)
    .single()
  
  console.log("oiiiiiiiiiiiii")

  if (error) throw error
  return data
}
