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

/**
 * ✅ Finaliza uma inspeção, atualizando todos os campos informados.
 */
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
  if (!inspectionId) throw new Error("ID da inspeção não fornecido.")

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

/**
 * ✅ Busca todos os testes disponíveis.
 */
export async function getAvailableTests(productId: string): Promise<TestRow[]> {
  const { data, error } = await supabaseClient
    .from("test_products")
    .select(`
      test:tests (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq("product_id", productId)
    .order("name", { foreignTable: "tests", ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar testes: ${error.message}`)
  }

  // Achata o resultado para retornar apenas os testes
  return (
    data?.map((row) => row.test).filter(Boolean) ?? []
  )
}

/**
 * ✅ Adiciona testes a uma inspeção e atualiza o timestamp.
 */
export async function addTestsToInspection(
  inspectionId: string,
  tests: { testId: string; result: string; notes?: string }[]
): Promise<{ success: true }> {
  if (!inspectionId) throw new Error("ID da inspeção não fornecido.")
  if (!tests || tests.length === 0) throw new Error("Nenhum teste informado.")

  const testRecords = tests.map((t) => ({
    inspection_id: inspectionId,
    test_id: t.testId,
    result: t.result,
    notes: t.notes || "",
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabaseClient.from("inspection_tests").insert(testRecords)
  if (error) throw new Error(`Erro ao adicionar testes: ${error.message}`)

  const { error: updateError } = await supabaseClient
    .from("inspections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", inspectionId)

  if (updateError)
    throw new Error(`Erro ao atualizar timestamp da inspeção: ${updateError.message}`)

  return { success: true }
}

export interface InspectionListItem {
  id: string
  batch: string
  arrivalDate: string
  expiryDate: string
  status: string
  product: {
    name: string,
    id: string
  }
  supplier: {
    nome: string
  }
}

export async function getAllInspections(): Promise<InspectionListItem[]> {
  const { data, error } = await supabaseClient
    .from("inspections")
    .select(`
      id,
      batch,
      created_at,
      expiry_date,
      status,
      product:products(name, id),
      supplier:revendedores(nome)
    `)
    .order("created_at", { ascending: false })



  if (error) {
    console.log(error)
    throw new Error(`Erro ao buscar inspeções: ${error.message}`)
  }

  return (
    data?.map((inspection) => ({
      id: inspection.id,
      batch: inspection.batch,
      arrivalDate: inspection.created_at,
      expiryDate: inspection.expiry_date,
      status: inspection.status,
      product: inspection.product,
      supplier: inspection.supplier,
    })) || []
  )
}


/**
 * ✅ Registra uma não conformidade e, opcionalmente, cria um plano de ação vinculado.
 */
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
  if (!inspectionId) throw new Error("ID da inspeção não fornecido.")
  if (!data.description || !data.severity)
    throw new Error("Descrição e gravidade são obrigatórias.")

  const { data: ncData, error: ncError } = await supabaseClient
    .from("non_conformities")
    .insert([
      {
        inspection_id: inspectionId,
        description: data.description.trim(),
        severity: data.severity,
        category: data.category || null,
        impact: data.impact || null,
        status: "Aberta",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (ncError) throw new Error(`Erro ao registrar não conformidade: ${ncError.message}`)

  if (data.createActionPlan && ncData) {
    if (!data.actionPlanDescription)
      throw new Error("Descrição do plano de ação é obrigatória quando ativado.")

    const { error: apError } = await supabaseClient
      .from("action_plans")
      .insert([
        {
          non_conformity_id: ncData.id,
          description: data.actionPlanDescription.trim(),
          status: "Pendente",
          due_date: data.actionPlanDueDate || null,
          responsible: data.actionPlanResponsible || null,
          created_at: new Date().toISOString(),
        },
      ])

    if (apError) throw new Error(`Erro ao criar plano de ação: ${apError.message}`)
  }

  return { success: true }
}

type CreateInspectionDTO = {
  product_id: string
  batch: string
  revendedor_id: string
  manufacturer_id: string
  expiry_date: string
  notes?: string
  color: string
  odor: string
  appearance: string
}

function resolveInspectionStatus(expiryDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  return expiry < today ? "Vencido" : "Pendente"
}

export async function createInspection(data: CreateInspectionDTO) {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser()

  if (userError || !user) {
    throw new Error("Usuário não autenticado")
  }

  const status = resolveInspectionStatus(data.expiry_date)

  const { error } = await supabaseClient
    .from("inspections")
    .insert({
      product_id: data.product_id,
      batch: data.batch,
      revendedor_id: data.revendedor_id,
      manufacturer_id: data.manufacturer_id,
      expiry_date: data.expiry_date,
      status, // 👈 AQUI ESTÁ A REGRA
      color: data.color,
      odor: data.odor,
      appearance: data.appearance,
      created_by: user.id,
    })

  if (error) {
    throw error
  }
}


// ---------------------- PRODUCTS ----------------------

/**
 * ✅ Cria um produto vinculado ao usuário autenticado.
 */
export async function createProduct(data: {
  name: string
  description?: string
  category_id: string
}): Promise<ProductRow> {
  const { data: userData, error: authError } = await supabaseClient.auth.getUser()
  if (authError) throw new Error("Erro ao verificar autenticação.")

  const userId = userData?.user?.id
  if (!userId) throw new Error("Usuário não autenticado. Faça login para criar produtos.")
  if (!data.name?.trim()) throw new Error("O nome do produto é obrigatório.")
  if (!data.category_id) throw new Error("A categoria é obrigatória.")

  const { data: product, error } = await supabaseClient
    .from("products")
    .insert([
      {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        category_id: data.category_id,
        user_id: userId,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar produto: ${error.message}`)
  return product
}

// ---------------------- CATEGORIES ----------------------

/**
 * ✅ Busca todas as categorias disponíveis.
 */
export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`Erro ao obter categorias: ${error.message}`)
  return data ?? []
}

/**
 * ✅ Cria uma categoria, vinculando ao usuário se autenticado.
 */
export async function createCategory(name: string): Promise<CategoryRow> {
  if (!name?.trim()) throw new Error("O nome da categoria é obrigatório.")

  const { data: userData, error: authError } = await supabaseClient.auth.getUser()
  if (authError) throw new Error("Erro ao verificar autenticação.")

  const userId = userData?.user?.id
  const insertData = userId ? { name: name.trim(), user_id: userId } : { name: name.trim() }

  const { data, error } = await supabaseClient
    .from("categories")
    .insert([insertData])
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar categoria: ${error.message}`)
  return data
}


