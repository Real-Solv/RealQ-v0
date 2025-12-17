"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  getRevendedorById,
  updateRevendedor,
  type Revendedor,
} from "@/lib/services/revendedores-service"

export default function EditRevendedorPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cidade, setCidade] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Buscar dados do revendedor
  useEffect(() => {
    async function fetchRevendedor() {
      try {
        const data = await getRevendedorById(id)

        if (!data) {
          console.error("Revendedor não encontrado")
          return
        }

        setNome(data.nome ?? "")
        setEmail(data.email ?? "")
        setTelefone(data.telefone ?? "")
        setCidade(data.cidade ?? "")
      } catch (error) {
        console.error("Erro ao carregar revendedor:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevendedor()
  }, [id])

  async function handleUpdate() {
    setSaving(true)

    try {
      await updateRevendedor(id, {
        nome,
        email: email || null,
        telefone: telefone || null,
        cidade: cidade || null,
      })

      router.push(`/dashboard/revendedores/${id}`)
    } catch (error: any) {
      alert("Erro ao atualizar revendedor")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Revendedor</h1>

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

      <label className="font-medium">Cidade</label>
      <Input
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        className="mb-6"
      />

      <div className="flex gap-3">
        <Button onClick={handleUpdate} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => router.push(`/dashboard/revendedores/${id}`)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
