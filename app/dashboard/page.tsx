"use client"

import { useState } from "react"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Overview } from "@/components/dashboard/overview"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Database } from "lucide-react"

export default function DashboardPage() {
  const { toast } = useToast()
  const [isSettingUp, setIsSettingUp] = useState(false)

  const handleSetupDatabase = async () => {
    try {
      setIsSettingUp(true)
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao configurar banco de dados")
      }

      toast({
        title: "Banco de dados configurado",
        description: "O banco de dados foi configurado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao configurar banco de dados:", error)
      toast({
        title: "Erro ao configurar banco de dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao configurar o banco de dados.",
        variant: "destructive",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Bem-vindo ao sistema de controle de qualidade RealQ</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Inspeções Pendentes</WhiteCardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </WhiteCardHeader>
          <WhiteCardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </WhiteCardContent>
        </WhiteCard>
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Não Conformidades</WhiteCardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </WhiteCardHeader>
          <WhiteCardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">-2 desde ontem</p>
          </WhiteCardContent>
        </WhiteCard>
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Planos de Ação</WhiteCardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </WhiteCardHeader>
          <WhiteCardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+3 desde ontem</p>
          </WhiteCardContent>
        </WhiteCard>
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Produtos Vencidos</WhiteCardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </WhiteCardHeader>
          <WhiteCardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 desde ontem</p>
          </WhiteCardContent>
        </WhiteCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <WhiteCard className="col-span-4">
          <WhiteCardHeader>
            <WhiteCardTitle>Inspeções por Período</WhiteCardTitle>
            <WhiteCardDescription>Número de inspeções realizadas nos últimos 30 dias</WhiteCardDescription>
          </WhiteCardHeader>
          <WhiteCardContent className="pl-2">
            <Overview />
          </WhiteCardContent>
        </WhiteCard>
        <WhiteCard className="col-span-3">
          <WhiteCardHeader>
            <WhiteCardTitle>Inspeções Recentes</WhiteCardTitle>
            <WhiteCardDescription>Últimas inspeções realizadas no sistema</WhiteCardDescription>
          </WhiteCardHeader>
          <WhiteCardContent>
            <RecentInspections />
          </WhiteCardContent>
        </WhiteCard>
      </div>
    </div>
  )
}
