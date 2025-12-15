export const dynamic = "force-dynamic"

import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

// Tipo oficial vindo do Supabase
export type Category = Database["public"]["Tables"]["categories"]["Row"]

// Tipo para JOIN com produtos
interface CategoryWithJoinedProducts extends Category {
  products?: { id: string }[] | null
}

// --------------------------------------------------
// Buscar todas as categorias
// --------------------------------------------------
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .order("name")

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    throw error
  }
}

// --------------------------------------------------
// Buscar categoria por ID — CORRIGIDO (maybeSingle)
// --------------------------------------------------
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle()   // 👈 evita erro 404 interno

    if (error) throw error
    return data ?? null
  } catch (error) {
    console.error(`Erro ao buscar categoria com ID ${id}:`, error)
    return null // 👈 evita quebrar a página
  }
}

// --------------------------------------------------
// Criar categoria (mantido — .single() é correto aqui)
// --------------------------------------------------
export async function createCategory(
  name: string,
  quantity: number
): Promise<Category> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .insert({
        name,
        produto_quantidade: quantity,
      })
      .select("*")
      .single() // 👈 Aqui precisa do single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    throw error
  }
}

// --------------------------------------------------
// Atualizar categoria (mantido — single permanece)
// --------------------------------------------------
export async function updateCategory(
  id: string,
  name: string
): Promise<Category> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .update({ name })
      .eq("id", id)
      .select("*")
      .single() // 👈 Aqui também precisa do single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Erro ao atualizar categoria com ID ${id}:`, error)
    throw error
  }
}

// --------------------------------------------------
// Excluir categoria
// --------------------------------------------------
export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error(`Erro ao excluir categoria com ID ${id}:`, error)
    throw error
  }
}

// --------------------------------------------------
// Categorias com contagem de produtos
// --------------------------------------------------
export async function getCategoriesWithProductCount(): Promise<
  (Category & { product_count: number })[]
> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select(`
        id,
        name,
        description,
        created_at,
        products:products(id)
      `)
      .order("created_at", { ascending: false })
      .throwOnError()

    const safeData = (data ?? []) as CategoryWithJoinedProducts[]

    return safeData.map((category) => ({
      ...category,
      product_count: category.products?.length || 0,
    }))
  } catch (error) {
    console.error("Erro ao buscar categorias com contagem:", error)
    throw error
  }
}

export async function getCategoryByIdWithProductCount(
  categoryId: string
): Promise<(Category & { product_count: number }) | null> {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select(`
        id,
        name,
        description,
        created_at,
        products:products(id)
      `)
      .eq("id", categoryId)
      .single()
      .throwOnError()

    if (!data) return null

    const category = data as CategoryWithJoinedProducts

    return {
      ...category,
      product_count: category.products?.length || 0,
    }
  } catch (error) {
    console.error("Erro ao buscar categoria por ID com contagem:", error)
    throw error
  }
}