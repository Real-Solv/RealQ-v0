"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"
import { ArrowLeft, Pencil, Package } from "lucide-react"
import { productService } from "@/lib/services/product-service"
import { getCategoryByIdWithProductCount } from "@/lib/services/category-service-extended"

type CategoryWithCount =
  Database["public"]["Tables"]["categories"]["Row"] & {
    product_count: number
  }

type Product = Database["public"]["Tables"]["products"]["Row"]

export default function CategoryDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const rawId = params?.id ?? ""
  const categoryId = Array.isArray(rawId) ? rawId[0] : rawId

  const [category, setCategory] = useState<CategoryWithCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError(null)

      const data = await productService.getByCategory(categoryId)
      setProducts(data)
    } catch (err) {
      console.error(err)
      setProductsError("Erro ao carregar produtos da categoria")
    } finally {
      setProductsLoading(false)
    }
  }

  // Função para carregar categoria
  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getCategoryByIdWithProductCount(categoryId)

      if (!data) {
        setCategory(null)
        return
      }

      setCategory(data)
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar categoria")
    } finally {
      setLoading(false)
    }
  }

  // Load inicial
  useEffect(() => {
    if (!categoryId) return
    loadCategory()
    loadProducts()
  }, [categoryId])

  // 🔴 REALTIME: atualiza automaticamente quando products ou categories mudarem
  useEffect(() => {
    if (!categoryId) return

    const channel = supabase
      .channel(`category-${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          loadCategory()
          loadProducts()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "categories",
          filter: `id=eq.${categoryId}`,
        },
        () => {
          loadCategory()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [categoryId])

  if (loading) return <div className="p-4">Carregando...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!category) return <div className="p-4">Categoria não encontrada.</div>

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/categorias")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>

        <button
          onClick={() =>
            router.push(`/dashboard/categorias/${categoryId}/editar`)
          }
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Pencil size={18} />
          Editar
        </button>
      </div>

      {/* Main Box */}
      <div className="bg-white border rounded-xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            Detalhes da Categoria
          </h2>
          <p className="text-gray-500">
            Informações detalhadas sobre esta categoria
          </p>
        </div>

        {/* Nome */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Nome</h3>
          <p className="text-lg">{category.name}</p>
        </div>

        {/* Quantidade de produtos (trigger) */}
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
          <Package className="text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-600">
              Quantidade total de produtos
            </h3>
            <p className="text-2xl font-bold">
              {category.product_count  ?? 0}
            </p>
          </div>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600">
              ID
            </h3>
            <p className="text-sm break-all">{category.id}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600">
              Data de Cadastro
            </h3>
            <p className="text-sm">
              {new Date(category.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Produtos Relacionados
          </h3>
          {productsLoading && (
            <p className="text-gray-500">Carregando produtos...</p>
          )}

          {productsError && (
            <p className="text-red-500">{productsError}</p>
          )}

          {!productsLoading && products.length === 0 && (
            <p className="text-gray-500">
              Nenhum produto cadastrado nesta categoria.
            </p>
          )}

          {products.length > 0 && (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>

                    {product.description && (
                      <p className="text-sm text-gray-500">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-gray-400">
                    {new Date(product.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
