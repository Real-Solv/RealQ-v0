// lib/services/dashboard-service.ts
import { supabaseClient } from "@/lib/supabase/client"

export interface DashboardStats {
  pendingInspections: number
  pendingInspectionsDiff: number
  nonConformities: number
  nonConformitiesDiff: number
  actionPlans: number
  actionPlansDiff: number
  expiredProducts: number
  expiredProductsDiff: number
}

export interface InspectionsByPeriod {
  date: string
  count: number
}

export interface RecentInspection {
  id: string
  product_name: string
  batch: string
  status: string
  created_at: string
  created_by_name: string
  created_by_initials: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = supabaseClient
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Inspeções pendentes
  const { count: pendingCount } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pendente')

  const { count: pendingYesterday } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pendente')
    .lte('created_at', yesterday.toISOString())

  // Não conformidades
  const { count: ncCount } = await supabase
    .from('non_conformities')
    .select('*', { count: 'exact', head: true })

  const { count: ncYesterday } = await supabase
    .from('non_conformities')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', yesterday.toISOString())

  // Planos de ação
  const { count: apCount } = await supabase
    .from('action_plans')
    .select('*', { count: 'exact', head: true })

  const { count: apYesterday } = await supabase
    .from('action_plans')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', yesterday.toISOString())

  // Produtos vencidos
  const { count: expiredCount } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })
    .lt('expiry_date', now.toISOString().split('T')[0])

  const { count: expiredYesterday } = await supabase
    .from('inspections')
    .select('*', { count: 'exact', head: true })
    .lt('expiry_date', yesterday.toISOString().split('T')[0])

  return {
    pendingInspections: pendingCount || 0,
    pendingInspectionsDiff: (pendingCount || 0) - (pendingYesterday || 0),
    nonConformities: ncCount || 0,
    nonConformitiesDiff: (ncCount || 0) - (ncYesterday || 0),
    actionPlans: apCount || 0,
    actionPlansDiff: (apCount || 0) - (apYesterday || 0),
    expiredProducts: expiredCount || 0,
    expiredProductsDiff: (expiredCount || 0) - (expiredYesterday || 0),
  }
}

export async function getRecentInspections() {
  // 1️⃣ Buscar as inspeções
  const { data: inspections, error } = await supabaseClient
    .from("inspections")
    .select(`
      id,
      batch,
      status,
      created_at,
      created_by,
      products (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Erro ao buscar inspeções recentes:", error)
    throw error
  }

  if (!inspections || inspections.length === 0) {
    return []
  }

  // 2️⃣ Coletar IDs únicos dos usuários
  const userIds = [...new Set(inspections.map(i => i.created_by))]

  // 3️⃣ Buscar usuários correspondentes
  const { data: users, error: usersError } = await supabaseClient
    .from("users")
    .select("auth_id, name, email")
    .in("auth_id", userIds)

  if (usersError) {
    console.error("Erro ao buscar usuários:", usersError)
  }

  // 4️⃣ Merge dos dados
  const inspectionsWithUsers = inspections.map(inspection => ({
    ...inspection,
    user: users?.find(u => u.auth_id === inspection.created_by) || null,
  }))

  return inspectionsWithUsers as RecentInspection[]
}

export async function getInspectionsByPeriod(days: number = 30): Promise<InspectionsByPeriod[]> {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('inspections')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar inspeções por período:', error)
    return []
  }

  // Agrupar por data
  const groupedByDate: { [key: string]: number } = {}
  
  data?.forEach((inspection) => {
    const date = new Date(inspection.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
    groupedByDate[date] = (groupedByDate[date] || 0) + 1
  })

  // Criar array de todos os dias no período
  const result: InspectionsByPeriod[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
    result.push({
      date: dateStr,
      count: groupedByDate[dateStr] || 0,
    })
  }

  return result
}

export type InspectionChartItem = {
  created_at: string
}

export async function getInspectionsForOverview() {
  const { data, error } = await supabaseClient
    .from("inspections")
    .select("created_at")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Erro ao buscar inspeções para overview:", error)
    throw error
  }

  return data as InspectionChartItem[]
}

// export async function getRecentInspections(limit: number = 5): Promise<RecentInspection[]> {
//   const supabase = createClient()

//   const { data, error } = await supabase
//     .from('inspections')
//     .select(`
//       id,
//       batch,
//       status,
//       created_at,
//       products (
//         name
//       ),
//       users:created_by (
//         name,
//         email
//       )
//     `)
//     .order('created_at', { ascending: false })
//     .limit(limit)

//   if (error) {
//     console.error('Erro ao buscar inspeções recentes:', error)
//     return []
//   }

//   return data?.map((inspection: any) => {
//     const userName = inspection.users?.name || inspection.users?.email || 'Desconhecido'
//     const initials = userName
//       .split(' ')
//       .map((n: string) => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)

//     return {
//       id: inspection.id,
//       product_name: inspection.products?.name || 'Produto desconhecido',
//       batch: inspection.batch,
//       status: inspection.status,
//       created_at: inspection.created_at,
//       created_by_name: userName,
//       created_by_initials: initials,
//     }
//   }) || []
// }