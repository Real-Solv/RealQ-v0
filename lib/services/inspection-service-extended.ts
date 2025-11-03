// lib/services/inspection-service-extended.ts
import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

// 🔹 Tipos automáticos baseados no schema
type InspectionRow = Database["public"]["Tables"]["inspections"]["Row"]
type InspectionUpdate = Database["public"]["Tables"]["inspections"]["Update"]
type TestRow = Database["public"]["Tables"]["tests"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

// ---------------------- INSPECTIONS ----------------------

export async function completeInspection(
  inspectionId: string,
  data: {
    color?: string
    odor?: string
    appearance?: string
    texture?: string
    temperature?: string
    humidity?: string
    notes?: string
    result: "approved" | "approved_with_restrictions" | "rejected"
  }
): Promise<{ success: true }> {
  const updates: InspectionUpdate = {
    ...(data.color && { color: data.color }),
    ...(data.odor && { odor: data.odor }),
    ...(data.appearance && { appearance: data.appearance }),
    ...(data.texture && { texture: data.texture }),
    ...(data.temperature && { temperature: data.temperature }),
    ...(data.humidity && { humidity: data.humidity }),
    ...(data.notes && { notes: data.notes }),
    status:
      data.result === "approved"
        ? "Aprovado"
        : data.result === "approved_with_restrictions"
        ? "Aprovado com Restrições"
        : "Reprovado",
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabaseClient
    .from("inspections")
    .update(updates)
    .eq("id", inspectionId)

  if (error) throw new Error(`Erro ao atualizar inspeção: ${error.message}`)
  return { success: true }
}

export async function getAvailableTests(): Promise<TestRow[]> {
  const { data, error } = await supabaseClient
    .from("tests")
    .select("*")
    .order("name")

  if (error) throw new Error(`Erro ao buscar testes: ${error.message}`)
  return data || []
}

export async function addTestsToInspection(
  inspectionId: string,
  tests: {
    testId: string
    result: string
    notes?: string
  }[]
): Promise<{ success: true }> {
  const testRecords = tests.map((test) => ({
    inspection_id: inspectionId,
    test_id: test.testId,
    result: test.result,
    notes: test.notes || "",
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabaseClient
    .from("inspection_tests")
    .insert(testRecords)

  if (error) throw new Error(`Erro ao adicionar testes: ${error.message}`)

  await supabaseClient
    .from("inspections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", inspectionId)

  return { success: true }
}

export async function registerNonConformity(
  inspectionId: string,
  data: {
    description: string
    severity: string
    category?: string
    impact?: string
    createActionPlan?: boolean
    actionPlanDescription?: string
    actionPlanDueDate?: string
    actionPlanResponsible?: string
  }
): Promise<{ success: true }> {
  const { data: ncData, error: ncError } = await supabaseClient
    .from("non_conformities")
    .insert({
      inspection_id: inspectionId,
      description: data.description,
      severity: data.severity,
      category: data.category || null,
      impact: data.impact || null,
      status: "Aberta",
      created_at: new Date().toISOString(),
    })
    .select()

  if (ncError)
    throw new Error(`Erro ao registrar não conformidade: ${ncError.message}`)

  if (data.createActionPlan && ncData && ncData.length > 0) {
    const { error: apError } = await supabaseClient.from("action_plans").insert({
      non_conformity_id: ncData[0].id,
      description: data.actionPlanDescription,
      status: "Pendente",
      due_date: data.actionPlanDueDate,
      responsible: data.actionPlanResponsible,
      created_at: new Date().toISOString(),
    })
    if (apError)
      throw new Error(`Erro ao criar plano de ação: ${apError.message}`)
  }

  return { success: true }
}

// ---------------------- PRODUCTS ----------------------

export async function createProduct(data: {
  name: string
  description?: string
  category_id: string
}): Promise<ProductRow> {
  const { data: product, error } = await supabaseClient
    .from("products")
    .insert({
      name: data.name,
      description: data.description || "",
      category_id: data.category_id,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar produto: ${error.message}`)
  return product
}

// ---------------------- CATEGORIES ----------------------

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw new Error(`Erro ao obter categorias: ${error.message}`)
  return data || []
}

/**
 * 🔹 Cria uma nova categoria (somente envia user_id se houver usuário logado)
 */
export async function createCategory(name: string): Promise<CategoryRow> {
  const { data: userData } = await supabaseClient.auth.getUser()
  const userId = userData?.user?.id

  // Monta objeto de insert
  const categoryInsert = userId ? { name, user_id: userId } : { name }

  const { data, error } = await supabaseClient
    .from("categories")
    .insert([categoryInsert])
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar categoria: ${error.message}`)
  return data
}
