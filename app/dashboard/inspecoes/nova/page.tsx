"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, X, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { createInspection } from "@/lib/services/inspection-service-extended"
import { productService } from "@/lib/services/product-service"
import { getAllManufacturers } from "@/lib/services/manufacturer-service-extended"
import { supabaseClient } from "@/lib/supabase/client"

// Tipos
interface Product {
  id: string
  name: string
  category: { name: string }
}

interface Manufacturer {
  id: string
  name: string
}

interface Supplier {
  id: string
  nome: string
}

// Função para formatar data no formato brasileiro
function formatDateToBR(date: string): string {
  if (!date) return ""
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

// Função para converter data BR para ISO
function formatDateToISO(date: string): string {
  if (!date) return ""
  const cleaned = date.replace(/\D/g, "")
  if (cleaned.length !== 8) return ""
  const day = cleaned.substring(0, 2)
  const month = cleaned.substring(2, 4)
  const year = cleaned.substring(4, 8)
  return `${year}-${month}-${day}`
}

// Máscara de data
function applyDateMask(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  let masked = cleaned
  
  if (cleaned.length >= 2) {
    masked = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`
  }
  if (cleaned.length >= 4) {
    masked = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`
  }
  
  return masked.substring(0, 10) // DD/MM/YYYY
}

export default function NewInspectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para os dados
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  
  const [formData, setFormData] = useState({
    productId: "",
    batch: "",
    supplierId: "",
    manufacturerId: "",
    expiryDate: "",
    expiryDateDisplay: "",
    notes: "",
    color: "",
    odor: "",
    appearance: "",
    photoFiles: [] as File[],
    photoPreview: [] as string[],
  })

  

  // Carregar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Buscar produtos
        const productsData = await productService.getAllWithCategory()
        setProducts(productsData)

        // Buscar fabricantes
        const manufacturersData = await getAllManufacturers()
        setManufacturers(manufacturersData)

        // Buscar fornecedores (revendedores)
        const { data: suppliersData, error } = await supabaseClient
          .from("revendedores")
          .select("*")
          .order("nome")

        if (error) {
          console.error("Erro ao carregar revendedores:", error)
          toast({
            title: "Erro ao carregar revendedores",
            description: "Não foi possível carregar a lista de revendedores.",
            variant: "destructive",
          })
        } else {
          setSuppliers(suppliersData || [])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createInspection({
        product_id: formData.productId,
        batch: formData.batch,
        revendedor_id: formData.supplierId,
        manufacturer_id: formData.manufacturerId,
        expiry_date: formData.expiryDate,
        notes: formData.notes,
        color: formData.color,
        odor: formData.odor,
        appearance: formData.appearance,
        photos: formData.photoFiles,
      })

      toast({
        title: "Inspeção criada",
        description: "A inspeção foi criada com sucesso e os testes foram vinculados automaticamente.",
      })

      router.push("/dashboard/inspecoes")
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao criar inspeção",
        description: "Não foi possível criar a inspeção.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const masked = applyDateMask(value)
    const isoDate = formatDateToISO(masked)
    
    setFormData((prev) => ({
      ...prev,
      expiryDateDisplay: masked,
      expiryDate: isoDate,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: File[] = []
    const newPreviews: string[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFiles.push(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === files.length) {
            setFormData((prev) => ({
              ...prev,
              photoFiles: [...prev.photoFiles, ...newFiles],
              photoPreview: [...prev.photoPreview, ...newPreviews],
            }))
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index),
      photoPreview: prev.photoPreview.filter((_, i) => i !== index),
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const canProceedToQuality =
    formData.productId && formData.batch && formData.supplierId && formData.manufacturerId && formData.expiryDate
  const canSubmit = canProceedToQuality && formData.color && formData.odor && formData.appearance

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/inspecoes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nova Inspeção</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Inspeção</CardTitle>
          <CardDescription>Preencha os dados para registrar uma nova inspeção de produto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="quality" disabled={!canProceedToQuality}>
                  Análise de Qualidade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="productId">Produto</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => handleSelectChange("productId", value)}
                      required
                    >
                      <SelectTrigger id="productId">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="batch">Lote</Label>
                    <Input
                      id="batch"
                      name="batch"
                      placeholder="Digite o número do lote"
                      value={formData.batch}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="supplierId">Fornecedor</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => handleSelectChange("supplierId", value)}
                      required
                    >
                      <SelectTrigger id="supplierId">
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="manufacturerId">Fabricante</Label>
                    <Select
                      value={formData.manufacturerId}
                      onValueChange={(value) => handleSelectChange("manufacturerId", value)}
                      required
                    >
                      <SelectTrigger id="manufacturerId">
                        <SelectValue placeholder="Selecione um fabricante" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.map((manufacturer) => (
                          <SelectItem key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="expiryDate">Data de Validade</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDateDisplay"
                      placeholder="DD/MM/AAAA"
                      value={formData.expiryDateDisplay}
                      onChange={handleDateChange}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Observações adicionais sobre o produto"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => handleTabChange("quality")} disabled={!canProceedToQuality}>
                    Próximo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="Descreva a cor do produto"
                      value={formData.color}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="odor">Odor</Label>
                    <Input
                      id="odor"
                      name="odor"
                      placeholder="Descreva o odor do produto"
                      value={formData.odor}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="appearance">Aspecto</Label>
                    <Input
                      id="appearance"
                      name="appearance"
                      placeholder="Descreva o aspecto do produto"
                      value={formData.appearance}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fotos</Label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {formData.photoPreview.map((photo, index) => (
                      <div key={index} className="relative rounded-md border">
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="h-32 w-full rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed cursor-pointer hover:bg-accent">
                      <Upload className="mb-2 h-6 w-6" />
                      <span className="text-sm">Adicionar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => handleTabChange("basic")}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !canSubmit}>
                    {isSubmitting ? "Salvando..." : "Salvar Inspeção"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}