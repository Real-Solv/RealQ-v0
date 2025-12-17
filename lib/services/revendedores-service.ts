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
  

  if (error) throw error
  return data
}

export async function updateRevendedor(
  id: string,
  data: {
    nome: string
    email?: string | null
    telefone?: string | null
    cidade?: string | null
  },
): Promise<void> {
  const { error } = await supabaseClient
    .from("revendedores")
    .update({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
    })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar revendedor:", error)
    throw error
  }
}