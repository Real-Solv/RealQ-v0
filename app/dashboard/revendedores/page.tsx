"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Input } from "@/components/ui/input"
import { RevendedorList } from "@/components/dashboard/revendedor-list"

export default function RevendedoresPage() {
  const [searchTerm, setSearchTerm] = useState("")

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
            Lista de todos os revendedores/fornecedores cadastrados
          </WhiteCardDescription>
        </WhiteCardHeader>
        <WhiteCardContent>
          <RevendedorList searchTerm={searchTerm} />
        </WhiteCardContent>
      </WhiteCard>
    </div>
  )
}
