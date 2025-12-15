  // /lib/services/test-service.ts

  import { supabase } from "@/lib/supabase/client"
  import type { Database } from "@/lib/database.types"

  // 🔹 Tipo derivado automaticamente do schema
  export type Test = Database["public"]["Tables"]["tests"]["Row"]

  // ========================================================
  // 🔹 Buscar todos os testes
  // ========================================================
  export async function getAllTests(): Promise<Test[]> {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .order("name")

    if (error) {
      console.error("Erro ao buscar testes:", error)
      throw error
    }

    return data ?? []
  }

  // ========================================================
  // 🔹 Buscar teste por ID
  // ========================================================
  export async function getTestById(id: string): Promise<Test | null> {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Registro não encontrado
        return null
      }
      console.error(`Erro ao buscar teste com ID ${id}:`, error)
      throw error
    }

    return data
  }


  export async function createTestWithProducts(data: {
    name: string
    description?: string
    productIds: string[]
  }): Promise<Test> {
    // 1️⃣ Cria o teste
    const { data: insertedTest, error: testError } = await supabase
      .from("tests")
      .insert({
        name: data.name,
        description: data.description ?? null,
      })
      .select()
      .single()

    if (testError) {
      console.error("Erro ao criar teste:", testError)
      throw testError
    }

    if (!insertedTest) {
      throw new Error("Teste não foi criado.")
    }

    // 2️⃣ Cria os vínculos na tabela test_products
    if (data.productIds.length > 0) {
      const relations = data.productIds.map((productId) => ({
        test_id: insertedTest.id,
        product_id: productId,
      }))

      const { error: relationError } = await supabase
        .from("test_products")
        .insert(relations)

      if (relationError) {
        console.error("Erro ao relacionar produtos ao teste:", relationError)
        throw relationError
      }
    }

    return insertedTest
  }


  // ========================================================
  // 🔹 Atualizar teste existente
  // ========================================================
  export async function updateTest(
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Test> {
    const { data: updated, error } = await supabase
      .from("tests")
      .update({
        name: data.name,
        description: data.description ?? null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar teste com ID ${id}:`, error)
      throw error
    }

    if (!updated) throw new Error(`Nenhum teste encontrado com ID ${id}.`)

    return updated
  }

  // ========================================================
  // 🔹 Excluir teste
  // ========================================================
  export async function deleteTest(id: string): Promise<void> {
    const { error } = await supabase
      .from("tests")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(`Erro ao excluir teste com ID ${id}:`, error)
      throw error
    }
  }

  export async function updateTestWithProducts(data: {
    id: string
    name: string
    description?: string
    productIds: string[]
  }): Promise<Test> {

    // 1️⃣ Atualiza o teste
    const { data: updatedTest, error: testError } = await supabase
      .from("tests")
      .update({
        name: data.name,
        description: data.description ?? null,
      })
      .eq("id", data.id)
      .select()
      .single()

    if (testError) {
      console.error("Erro ao atualizar teste:", testError)
      throw testError
    }

    if (!updatedTest) {
      throw new Error("Teste não encontrado.")
    }

    // 2️⃣ Remove todas as relações antigas
    const { error: deleteError } = await supabase
      .from("test_products")
      .delete()
      .eq("test_id", data.id)

    if (deleteError) {
      console.error("Erro ao remover relações antigas:", deleteError)
      throw deleteError
    }

    // 3️⃣ Insere as novas relações
    if (data.productIds.length > 0) {
      const relations = data.productIds.map((productId) => ({
        test_id: data.id,
        product_id: productId,
      }))

      const { error: insertError } = await supabase
        .from("test_products")
        .insert(relations)

      if (insertError) {
        console.error("Erro ao criar novas relações:", insertError)
        throw insertError
      }
    }

    return updatedTest
  }

export async function getProductIdsByTest(testId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("test_products")
    .select("product_id")
    .eq("test_id", testId)

  if (error) {
    console.error("Erro ao buscar produtos do teste:", error)
    throw error
  }

  return data.map((item) => item.product_id)
}


