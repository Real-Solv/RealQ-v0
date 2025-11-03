"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NovaPage() {
  const router = useRouter()
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aqui você pode chamar a função do seu service (ex: createActionPlan)
      console.log("Criando ação:", descricao)

      // Após salvar, redireciona para a lista
      router.push("/dashboard/acoes")
    } catch (err) {
      console.error("Erro ao criar ação:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nova Ação</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          Descrição da ação
          <Input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Ação"}
        </Button>
      </form>
    </div>
  )
}
