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
import { ManufacturerList } from "@/components/dashboard/manufacturer-list"

export default function ManufacturersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtores</h2>
          <p className="text-muted-foreground">Gerencie os produtores/fabricantes dos produtos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/produtores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produtor
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Buscar por nome, contato, email ou endereço..."
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
          <WhiteCardTitle>Todos os Produtores</WhiteCardTitle>
          <WhiteCardDescription>Lista de todos os produtores/fabricantes cadastrados no sistema</WhiteCardDescription>
        </WhiteCardHeader>
        <WhiteCardContent>
          <ManufacturerList searchTerm={searchTerm} />
        </WhiteCardContent>
      </WhiteCard>
    </div>
  )
}
