import { ApiService } from "./api"
import type { Database } from "@/lib/database.types"
import { supabaseClient } from "@/lib/supabase/client"

// Tipo para o plano de ação
export type ActionPlan = Database["public"]["Tables"]["action_plans"]["Row"]
export type ActionPlanInput = Omit<ActionPlan, "id" | "created_at">
export type ActionPlanUpdate = Partial<ActionPlanInput>

export interface ActionPlanAll {
  id: string
  inspection_id: string
  description: string
  status: string
  due_date: string
  created_at: string
  created_by: string
  inspections: {
    batch: string
    products: {
      name: string
    }
  }
}

export async function getActionPlans() {
  const { data: actionPlans, error } = await supabaseClient
    .from('action_plans')
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
    console.error('Erro ao buscar planos de ação:', error)
    throw error
  }

  // Buscar os IDs únicos dos usuários
  const userIds = [...new Set(actionPlans.map(ap => ap.created_by))]

  // Buscar os usuários correspondentes
  const { data: users, error: usersError } = await supabaseClient
    .from('users')
    .select('auth_id, name, email')
    .in('auth_id', userIds)

  if (usersError) {
    console.error('Erro ao buscar usuários:', usersError)
  }

  // Fazer o merge dos dados
  const actionPlansWithUsers = actionPlans.map(ap => ({
    ...ap,
    users: users?.find(u => u.auth_id === ap.created_by) || null
  }))

  return actionPlansWithUsers as ActionPlanAll[]
}

export class ActionPlanService extends ApiService<ActionPlan> {
  constructor() {
    super("action_plans")
  }

  // Métodos específicos para planos de ação

  // Buscar planos de ação com detalhes da inspeção
  async getAllWithDetails(): Promise<
    (ActionPlan & {
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
      .order("due_date")

    if (error) {
      throw new Error(`Erro ao buscar planos de ação com detalhes: ${error.message}`)
    }

    return data as (ActionPlan & {
      inspection: {
        product: { name: string }
        batch: string
      }
    })[]
  }

  // Buscar planos de ação por inspeção
  async getByInspection(inspectionId: string): Promise<ActionPlan[]> {
    const { data, error } = await supabaseClient
      .from(this.tableName)
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("due_date")

    if (error) {
      throw new Error(`Erro ao buscar planos de ação da inspeção ${inspectionId}: ${error.message}`)
    }

    return data as ActionPlan[]
  }
}

// Instância singleton do serviço
export const actionPlanService = new ActionPlanService()
