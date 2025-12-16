import { supabaseClient } from "@/lib/supabase/client"

// Tipo para o fabricante (produtor)
export interface Manufacturer {
  id: string
  name: string
  address: string | null
  email: string | null
  phone: string | null
  created_at: string
}

// Função para obter todos os fabricantes
export async function getAllManufacturers(): Promise<Manufacturer[]> {
  try {
    const { data, error } = await supabaseClient
      .from("manufacturers")
      .select("*")
      .order("name")

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar fabricantes:", error)
    throw error
  }
}

// Função para obter um fabricante específico por ID
export async function getManufacturerById(
  id: string,
): Promise<Manufacturer | null> {
  try {
    const { data, error } = await supabaseClient
      .from("manufacturers")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if ((error as any).code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error(`Erro ao buscar fabricante com ID ${id}:`, error)
    throw error
  }
}

// Função para criar um fabricante
export async function createManufacturer(data: {
  name: string
  address?: string | null
  email?: string | null
  phone?: string | null
}): Promise<Manufacturer> {
  try {
    const { data: manufacturer, error } = await supabaseClient
      .from("manufacturers")
      .insert({
        name: data.name,
        address: data.address ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return manufacturer
  } catch (error) {
    console.error("Erro ao criar fabricante:", error)
    throw error
  }
}

// Função para atualizar um fabricante
export async function updateManufacturer(
  id: string,
  data: {
    name: string
    address?: string | null
    email?: string | null
    phone?: string | null
  },
): Promise<void> {
  const { error } = await supabaseClient
    .from("manufacturers")
    .update({
      name: data.name,
      address: data.address ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
    })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar fabricante:", error)
    throw error
  }
}

// Função para excluir um fabricante
export async function deleteManufacturer(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from("manufacturers")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error(`Erro ao excluir fabricante com ID ${id}:`, error)
    throw error
  }
}
