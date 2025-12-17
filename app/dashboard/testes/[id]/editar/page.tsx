// app/dashboard/testes/[id]/editar/page.tsx
"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { productService, type Product } from "@/lib/services/product-service"

import { getTestById, updateTestWithProducts, getProductIdsByTest } from "@/lib/services/test-service"
import type { Test } from "@/lib/services/test-service"

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const selectedProductObjects = products.filter((product) =>
    selectedProducts.includes(product.id)
  )

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ------------------------------------------
  // 🔹 Carregar dados do teste ao abrir página
  // ------------------------------------------
  useEffect(() => {
    if (!id) return

    ;(async () => {
      try {
        const test = await getTestById(id)
        if (!test) throw new Error("Teste não encontrado")

        setName(test.name)
        setDescription(test.description ?? "")

        const productsData = await productService.getAllWithCategory()
        setProducts(productsData)

        const relatedProducts = await getProductIdsByTest(id)
        setSelectedProducts(relatedProducts)

      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do teste.",
          variant: "destructive",
        })
        router.push("/dashboard/testes")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  


  // ------------------------------------------
  // 🔹 Salvar edição
  // ------------------------------------------
async function handleUpdate() {
  setSaving(true)
  try {
    await updateTestWithProducts({
      id,
      name,
      description,
      productIds: selectedProducts,
    })

    toast({
      title: "Atualizado",
      description: "Teste atualizado com sucesso.",
    })

    router.push(`/dashboard/testes/${id}`)
  } catch (error) {
    toast({
      title: "Erro ao salvar",
      description: "Erro ao atualizar teste.",
      variant: "destructive",
    })
  } finally {
    setSaving(false)
  }
}
const toggleProduct = (productId: string) => {
  setSelectedProducts((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  )
}


  if (loading) return <p>Carregando...</p>

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Teste</h1>

      {/* Nome */}
      <label className="font-medium">Nome</label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4"
        required
      />

      {/* Descrição */}
      <label className="font-medium">Descrição</label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-6"
      />

      <div className="space-y-3 mb-6">
        <label className="font-medium">Produtos relacionados</label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedProducts.length > 0
                ? `${selectedProducts.length} produto(s) selecionado(s)`
                : "Selecione os produtos"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar produto..." />
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>

              <CommandGroup className="max-h-64 overflow-y-auto">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => toggleProduct(product.id)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={`h-4 w-4 ${
                        selectedProducts.includes(product.id)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />

                    <span>
                      {product.name}
                      <span className="text-muted-foreground text-xs">
                        {" "}({product.category.name})
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Produtos selecionados */}
        {selectedProductObjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedProductObjects.map((product) => (
              <Badge key={product.id} variant="secondary" className="gap-1">
                {product.name}
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>


      

      {/* Botões */}
      <div className="flex gap-4">
        <Button onClick={handleUpdate} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => router.push(`/dashboard/testes/${id}`)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
