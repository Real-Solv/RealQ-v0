// /lib/services/test-service.ts

import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

// 🔹 Tipo derivado automaticamente do seu schema Supabase
export type Test = Database["public"]["Tables"]["tests"]["Row"]

// -------------------------------------------
// 🔹 Buscar todos os testes
// -------------------------------------------
export async function getAllTests(): Promise<Test[]> {
  try {
    const { data, error } = await supabaseClient
      .from("tests")
      .select("*")
      .order("name")

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error("Erro ao buscar testes:", error)
    throw error
  }
}

// -------------------------------------------
// 🔹 Buscar teste por ID
// -------------------------------------------
export async function getTestById(id: string): Promise<Test | null> {
  try {
    const { data, error } = await supabaseClient
      .from("tests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Registro não encontrado
      throw error
    }

    return data
  } catch (error) {
    console.error(`Erro ao buscar teste com ID ${id}:`, error)
    throw error
  }
}

// -------------------------------------------
// 🔹 Criar novo teste
// -------------------------------------------
export async function createTest(data: { name: string; description?: string }): Promise<Test> {
  try {
    const { data: inserted, error } = await supabaseClient
      .from("tests")
      .insert({
        name: data.name,
        description: data.description ?? null, // ✅ usa null caso não seja passado
      })
      .select()
      .single()

    if (error) throw error
    if (!inserted) throw new Error("Nenhum registro retornado ao criar teste.")

    return inserted
  } catch (error) {
    console.error("Erro ao criar teste:", error)
    throw error
  }
}

// -------------------------------------------
// 🔹 Atualizar teste existente
// -------------------------------------------
export async function updateTest(
  id: string,
  data: { name?: string; description?: string }
): Promise<Test> {
  try {
    const { data: updated, error } = await supabaseClient
      .from("tests")
      .update({
        name: data.name,
        description: data.description ?? null, // ✅ evita problemas com undefined
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    if (!updated) throw new Error(`Nenhum teste encontrado com ID ${id}.`)

    return updated
  } catch (error) {
    console.error(`Erro ao atualizar teste com ID ${id}:`, error)
    throw error
  }
}

// -------------------------------------------
// 🔹 Excluir teste
// -------------------------------------------
export async function deleteTest(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient.from("tests").delete().eq("id", id)
    if (error) throw error
  } catch (error) {
    console.error(`Erro ao excluir teste com ID ${id}:`, error)
    throw error
  }
}
