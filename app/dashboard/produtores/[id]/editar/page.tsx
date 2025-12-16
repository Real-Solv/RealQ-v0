"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import {
  getManufacturerById,
  updateManufacturer,
} from "@/lib/services/manufacturer-service-extended"

export default function EditManufacturerPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    contact: "",
    address: "",
  })

  // 🔹 Carregar produtor
  useEffect(() => {
    if (!id) return

    ;(async () => {
      try {
        const manufacturer = await getManufacturerById(id)

        if (!manufacturer) throw new Error("Produtor não encontrado")

        setFormData({
          nome: manufacturer.name,
          email: manufacturer.email ?? "",
          telefone: manufacturer.phone ?? "",
          contact: manufacturer.contact ?? "",
          address: manufacturer.address ?? "",
        })
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao carregar produtor.",
          variant: "destructive",
        })
        router.push("/dashboard/produtores")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleUpdate() {
    setSaving(true)
    try {
      await updateManufacturer(id, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        contact: formData.contact,
        address: formData.address,
      })

      toast({
        title: "Atualizado",
        description: "Produtor atualizado com sucesso.",
      })

      router.push("/dashboard/produtores")
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produtor.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Editar Produtor</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Nome</Label>
          <Input name="nome" value={formData.nome} onChange={handleChange} />
        </div>

        <div>
          <Label>Pessoa de Contato</Label>
          <Input name="contact" value={formData.contact} onChange={handleChange} />
        </div>

        <div>
          <Label>Telefone</Label>
          <Input name="telefone" value={formData.telefone} onChange={handleChange} />
        </div>

        <div>
          <Label>Email</Label>
          <Input name="email" value={formData.email} onChange={handleChange} />
        </div>

        {/* 🔹 NOVO CAMPO */}
        <div>
          <Label>Endereço</Label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Rua, número, bairro, cidade"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/produtores")}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
