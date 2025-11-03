"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ActionsList } from "@/components/dashboard/actions-list"
import { NonConformitiesList } from "@/components/dashboard/non-conformities-list"

export default function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ações</h2>
          <p className="text-muted-foreground">
            Gerencie planos de ação e não conformidades
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/acoes/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Ação
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Buscar por produto, lote ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline">Filtrar</Button>
          <Button variant="outline">Exportar</Button>
        </div>
      </div>

      <Tabs defaultValue="action-plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="action-plans">Planos de Ação</TabsTrigger>
          <TabsTrigger value="non-conformities">Não Conformidades</TabsTrigger>
        </TabsList>

        <TabsContent value="action-plans" className="space-y-4">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Planos de Ação</WhiteCardTitle>
              <WhiteCardDescription>
                Lista de planos de ação para resolver problemas identificados
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              <ActionsList searchTerm={searchTerm} />
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>

        <TabsContent value="non-conformities" className="space-y-4">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Não Conformidades</WhiteCardTitle>
              <WhiteCardDescription>
                Lista de não conformidades identificadas nas inspeções
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              <NonConformitiesList searchTerm={searchTerm} />
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
