// lib/services/inspection-service-extended.ts
import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

// 🔹 Tipos automáticos baseados no schema
type InspectionRow = Database["public"]["Tables"]["inspections"]["Row"]
type InspectionUpdate = Database["public"]["Tables"]["inspections"]["Update"]
type TestRow = Database["public"]["Tables"]["tests"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

// ---------------------- TIPOS ADICIONAIS ----------------------

export interface InspectionDetail {
  id: string
  batch: string
  expiry_date: string
  status: string
  created_at: string
  
  photos?: string[]   // 👈 ADICIONE ISSO

  color?: string
  odor?: string
  appearance?: string
  texture?: string
  temperature?: number
  humidity?: number
  product: {
    id: string
    name: string
  }
  revendedor: {
    id: string
    name: string
  }
  manufacturer: {
    id: string
    name: string
  }
  inspection_tests: Array<{
    id: string
    result: string
    notes?: string
    passed: boolean
    test: {
      id: string
      name: string
    }
  }>
  non_conformities: Array<{
    id: string
    description: string
    severity: string
    created_at: string
  }>
  action_plans: Array<{
    id: string
    description: string
    status: string
    due_date: string
    created_by: string
  }>
}

export interface UpdateTestData {
  notes?: string
  passed: boolean
  result: string
}

export interface CreateNonConformityData {
  inspection_id: string
  description: string
  severity: string
  created_by: string
}

export interface CreateActionPlanData {
  inspection_id: string
  description: string
  status: string
  due_date: string
  created_by: string
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




// ---------------------- FUNÇÕES AUXILIARES ----------------------


async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser()
    return user?.id || null
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error)
    return null
  }
}

export interface CreateInspectionDTO {
  product_id: string
  batch: string
  revendedor_id: string
  manufacturer_id: string
  expiry_date: string
  notes?: string
  color: string
  odor: string
  appearance: string
  photos?: File[]
}

function resolveInspectionStatus(expiryDate: string): string {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Vencido"
  return "Pendente"
}

async function uploadPhotos(files: File[], inspectionId: string): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split(".").pop()
    const fileName = `${inspectionId}_${i}_${Date.now()}.${fileExt}`
    const filePath = `inspections/${fileName}`

    const { error: uploadError } = await supabaseClient.storage
      .from("inspection-photos")
      .upload(filePath, file)

    if (uploadError) {
      console.log(uploadError)
      console.error("Erro ao fazer upload da foto:", uploadError)
      throw uploadError
    }

    const { data: urlData } = supabaseClient.storage
      .from("inspection-photos")
      .getPublicUrl(filePath)

    uploadedUrls.push(urlData.publicUrl)
  }

  return uploadedUrls
}

async function getProductTests(productId: string): Promise<string[]> {
  const { data, error } = await supabaseClient
    .from("test_products")
    .select("test_id")
    .eq("product_id", productId)

  if (error) {
    console.error("Erro ao buscar testes do produto:", error)
    throw error
  }

  return data?.map((item) => item.test_id) || []
}

async function createDefaultInspectionTests(
  inspectionId: string,
  testIds: string[]
): Promise<void> {
  if (testIds.length === 0) return

  // Criar registros com valores padrão
  const inspectionTestsData = testIds.map((testId) => ({
    inspection_id: inspectionId,
    test_id: testId,
    result: null, // Será preenchido depois
    notes: null, // Será preenchido depois
    passed: false, // Padrão: não aprovado
  }))

  const { error } = await supabaseClient
    .from("inspection_tests")
    .insert(inspectionTestsData)

  if (error) {
    console.error("Erro ao criar testes de inspeção:", error)
    throw error
  }
}


function parseBrazilianDateToISO(date: string): string {
  // Já está no formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // Formato brasileiro DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/")
    return `${year}-${month}-${day}`
  }

  throw new Error(`Formato de data inválido: ${date}`)
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

  // Criar a inspeção
  const { data: inspectionData, error: inspectionError } = await supabaseClient
    .from("inspections")
    .insert({
      product_id: data.product_id,
      batch: data.batch,
      revendedor_id: data.revendedor_id,
      manufacturer_id: data.manufacturer_id,
      expiry_date: data.expiry_date,
      status,
      color: data.color,
      odor: data.odor,
      appearance: data.appearance,
      created_by: user.id,
    })
    .select()
    .single()

  if (inspectionError) {
    console.error("Erro ao criar inspeção:", inspectionError)
    throw inspectionError
  }

  const inspectionId = inspectionData.id
  console.log("photo:", data.photos)

  // Upload de fotos (se houver)
  if (data.photos && data.photos.length > 0) {
    try {
      const photoUrls = await uploadPhotos(data.photos, inspectionId)
      
      // Atualizar inspeção com as URLs das fotos
      const { error: updateError } = await supabaseClient
        .from("inspections")
        .update({ photos: photoUrls })
        .eq("id", inspectionId)

      if (updateError) {
        console.log("error phot:", updateError)
        console.error("Erro ao atualizar fotos da inspeção:", updateError)
      }
    } catch (error) {
      console.error("Erro no upload de fotos:", error)
      // Não falhar a inspeção se o upload de fotos falhar
    }
  }

  // Buscar testes do produto e criar registros padrão
  try {
    const testIds = await getProductTests(data.product_id)
    if (testIds.length > 0) {
      await createDefaultInspectionTests(inspectionId, testIds)
    }
  } catch (error) {
    console.error("Erro ao criar testes de inspeção:", error)
    // Não falhar a inspeção se a criação de testes falhar
  }

  return inspectionData
}

export { getProductTests }

// ---------------------- INSPEÇÕES - DETALHES ----------------------

/**
 * ✅ Busca detalhes completos de uma inspeção com todos os relacionamentos
 */
export async function getInspectionDetail(inspectionId: string): Promise<InspectionDetail | null> {
  try {
    const { data, error } = await supabaseClient
      .from('inspections')
      .select(`
        *,
        product:products(id, name),
        revendedor:revendedores(id, nome),
        manufacturer:manufacturers(id, name),
        inspection_tests(
          id,
          result,
          notes,
          passed,
          test:tests(id, name)
        ),
        non_conformities(
          id,
          description,
          severity,
          created_at
        ),
        action_plans(
          id,
          description,
          status,
          due_date,
          created_by
        )
      `)
      .eq('id', inspectionId)
      .single()

    if (error) throw error

    // Mapear o campo 'nome' do revendedor para 'name' para consistência
    return {
      ...data,
      revendedor: {
        id: data.revendedor.id,
        name: data.revendedor.nome
      }
    } as InspectionDetail
  } catch (error) {
    console.error('Erro ao buscar detalhes da inspeção:', error)
    throw error
  }
}

// ---------------------- INSPEÇÕES - LISTAGEM ----------------------

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




// ---------------------- INSPEÇÕES - FINALIZAÇÃO ----------------------

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

// ---------------------- TESTES ----------------------

/**
 * ✅ Busca todos os testes disponíveis para um produto.
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
    notes: t.notes ?? null,
  }))

  const { error } = await supabaseClient
    .from("inspection_tests")
    .upsert(testRecords, {
      onConflict: "inspection_id,test_id",
    })

  if (error) {
    throw new Error(`Erro ao salvar testes da inspeção: ${error.message}`)
  }

  return { success: true }
}

/**
 * ✅ Atualiza um teste específico da inspeção (notas, status passou/não passou)
 */
export async function updateInspectionTest(
  testId: string,
  updateData: UpdateTestData
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('inspection_tests')
      .update(updateData)
      .eq('id', testId)

    if (error) throw error
  } catch (error) {
    console.error('Erro ao atualizar teste:', error)
    throw error
  }
}

// ---------------------- NÃO CONFORMIDADES ----------------------

/**
 * ✅ Registra uma não conformidade (versão simplificada para o novo fluxo)
 */
export async function createNonConformity(
  data: CreateNonConformityData
): Promise<{ id: string }> {
  try {
    const { data: ncData, error } = await supabaseClient
      .from('non_conformities')
      .insert(data)
      .select('id')
      .single()

    if (error) throw error
    return { id: ncData.id }
  } catch (error) {
    console.error('Erro ao criar não conformidade:', error)
    throw error
  }
}

/**
 * ✅ Registra uma não conformidade com opção de criar plano de ação (versão completa)
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

  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Usuário não autenticado")

  const { data: ncData, error: ncError } = await supabaseClient
    .from("non_conformities")
    .insert([
      {
        inspection_id: inspectionId,
        description: data.description.trim(),
        severity: data.severity,
        created_by: userId,
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
          inspection_id: inspectionId,
          description: data.actionPlanDescription.trim(),
          status: "Pendente",
          due_date: data.actionPlanDueDate || null,
          created_by: userId,
          created_at: new Date().toISOString(),
        },
      ])

    if (apError) throw new Error(`Erro ao criar plano de ação: ${apError.message}`)
  }

  return { success: true }
}

// ---------------------- PLANOS DE AÇÃO ----------------------

/**
 * ✅ Cria um plano de ação
 */
export async function createActionPlan(
  data: CreateActionPlanData
): Promise<{ id: string }> {
  try {
    const { data: apData, error } = await supabaseClient
      .from('action_plans')
      .insert(data)
      .select('id')
      .single()

    if (error) throw error
    return { id: apData.id }
  } catch (error) {
    console.error('Erro ao criar plano de ação:', error)
    throw error
  }
}

/**
 * ✅ Cria não conformidade e plano de ação simultaneamente
 */
export async function createNonConformityWithActionPlan(
  nonConformityData: CreateNonConformityData,
  actionPlanData: CreateActionPlanData
): Promise<{ nonConformityId: string; actionPlanId: string }> {
  try {
    // Criar não conformidade
    const { data: ncData, error: ncError } = await supabaseClient
      .from('non_conformities')
      .insert(nonConformityData)
      .select('id')
      .single()

    if (ncError) throw ncError

    // Criar plano de ação
    const { data: apData, error: apError } = await supabaseClient
      .from('action_plans')
      .insert(actionPlanData)
      .select('id')
      .single()

    if (apError) throw apError

    return {
      nonConformityId: ncData.id,
      actionPlanId: apData.id,
    }
  } catch (error) {
    console.error('Erro ao criar não conformidade e plano de ação:', error)
    throw error
  }
}

// ---------------------- UTILITÁRIOS ----------------------

/**
 * ✅ Retorna o ID do usuário autenticado
 */
export { getCurrentUserId }