import { ApiService } from "./api"
import type { Database } from "@/lib/database.types"
import { supabaseClient } from "@/lib/supabase/client"

// Tipo para a não conformidade
export type NonConformity = Database["public"]["Tables"]["non_conformities"]["Row"]
export type NonConformityInput = Omit<NonConformity, "id" | "created_at">
export type NonConformityUpdate = Partial<NonConformityInput>


export async function getNonConformities() {
  const { data: nonConformities, error } = await supabaseClient
    .from('non_conformities')
    .select(`
      *,
      inspections (
        batch,
        products (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar não conformidades:', error)
    throw error
  }

  // Buscar os IDs únicos dos usuários
  const userIds = [...new Set(nonConformities.map(nc => nc.created_by))]

  // Buscar os usuários correspondentes
  const { data: users, error: usersError } = await supabaseClient
    .from('users')
    .select('auth_id, name, email')
    .in('auth_id', userIds)

  if (usersError) {
    console.error('Erro ao buscar usuários:', usersError)
  }

  // Fazer o merge dos dados
  const nonConformitiesWithUsers = nonConformities.map(nc => ({
    ...nc,
    users: users?.find(u => u.auth_id === nc.created_by) || null
  }))

  return nonConformitiesWithUsers as NonConformity[]
}

export class NonConformityService extends ApiService<NonConformity> {
  constructor() {
    super("non_conformities")
  }

  

  // Métodos específicos para não conformidades

  // Buscar não conformidades com detalhes da inspeção
  async getAllWithDetails(): Promise<
    (NonConformity & {
      inspection: {
        product: { name: string }
        batch: string
      }
    })[]
  > {
    const { data, error } = await supabaseClient
      .from(this.tableName)
      .select(`
        *,
        inspection:inspections(
          batch,
          product:products(name)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar não conformidades com detalhes: ${error.message}`)
    }

    return data as (NonConformity & {
      inspection: {
        product: { name: string }
        batch: string
      }
    })[]
  }

  

  // Buscar não conformidades por inspeção
  async getByInspection(inspectionId: string): Promise<NonConformity[]> {
    const { data, error } = await supabaseClient
      .from(this.tableName)
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar não conformidades da inspeção ${inspectionId}: ${error.message}`)
    }

    return data as NonConformity[]
  }
}

// Instância singleton do serviço
export const nonConformityService = new NonConformityService()
