"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  getManufacturerById,
  updateManufacturer,
} from "@/lib/services/manufacturer-service-extended"

export default function EditManufacturerPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [contato, setContato] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Buscar dados do produtor
  useEffect(() => {
    async function fetchManufacturer() {
      const data = await getManufacturerById(id)

      if (!data) {
        console.error("Produtor não encontrado")
        return
      }

      setNome(data.name ?? "")
      setEmail(data.email ?? "")
      setTelefone(data.phone ?? "")
      setContato(data.contact ?? "")

      setLoading(false)
    }

    fetchManufacturer()
  }, [id])

  async function handleUpdate() {
    setSaving(true)

    const errorHandler = async () => {
      try {
        await updateManufacturer(id, {
          nome,
          email: email || null,
          telefone: telefone || null,
          contact: contato || null,
        })

        router.push(`/dashboard/produtores/${id}`)
      } catch {
        alert("Erro ao atualizar produtor")
      } finally {
        setSaving(false)
      }
    }

    errorHandler()
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Produtor</h1>

      <label className="font-medium">Nome</label>
      <Input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="mb-4"
      />

      <label className="font-medium">Email</label>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4"
      />

      <label className="font-medium">Telefone</label>
      <Input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="mb-4"
      />

      <label className="font-medium">Contato</label>
      <Input
        value={contato}
        onChange={(e) => setContato(e.target.value)}
        className="mb-6"
      />

      <div className="flex gap-3">
        <Button onClick={handleUpdate} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => router.push(`/dashboard/produtores/${id}`)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
