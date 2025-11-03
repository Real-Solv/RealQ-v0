"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { supabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Input } from "@/components/ui/input"

interface Revendedor {
  id: string
  nome: string
  email: string
  telefone: string
  cidade: string
  created_at: string
}

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [revendedores, setRevendedores] = useState<Revendedor[]>([])
  const [loading, setLoading] = useState(true)

  // Busca os revendedores do Supabase
  useEffect(() => {
    async function fetchRevendedores() {
      const { data, error } = await supabaseClient
        .from("revendedores")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar revendedores:", error)
      } else {
        setRevendedores(data || [])
      }
      setLoading(false)
    }

    fetchRevendedores()
  }, [])

  // Filtra pelo termo de busca
  const filtered = revendedores.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.cidade?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revendedores</h2>
          <p className="text-muted-foreground">
            Gerencie os revendedores/fornecedores dos produtos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/revendedores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Revendedor
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Buscar por nome, email ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline">Filtrar</Button>
          <Button variant="outline">Exportar</Button>
        </div>
      </div>

      <WhiteCard>
        <WhiteCardHeader>
          <WhiteCardTitle>Todos os Revendedores</WhiteCardTitle>
          <WhiteCardDescription>
            Lista de todos os revendedores/fornecedores cadastrados no sistema
          </WhiteCardDescription>
        </WhiteCardHeader>
        <WhiteCardContent>
          {loading ? (
            <p>Carregando revendedores...</p>
          ) : filtered.length === 0 ? (
            <p>Nenhum revendedor encontrado.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => (
                <li key={r.id} className="border p-2 rounded">
                  <strong>{r.nome}</strong> — {r.email} — {r.telefone} — {r.cidade}
                </li>
              ))}
            </ul>
          )}
        </WhiteCardContent>
      </WhiteCard>
    </div>
  )
}
