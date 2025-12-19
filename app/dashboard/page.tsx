"use client"

import { useEffect, useState } from "react"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Overview } from "@/components/dashboard/overview"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { getDashboardStats, type DashboardStats } from "@/lib/services/dashboard-service"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ClipboardList, 
  AlertTriangle, 
  FileText, 
  CalendarX 
} from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatDiff = (diff: number) => {
    if (diff === 0) return "sem alterações"
    const sign = diff > 0 ? "+" : ""
    return `${sign}${diff} desde ontem`
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
        {/* Inspeções Pendentes */}
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Inspeções Pendentes</WhiteCardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </WhiteCardHeader>
          <WhiteCardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingInspections || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDiff(stats?.pendingInspectionsDiff || 0)}
                </p>
              </>
            )}
          </WhiteCardContent>
        </WhiteCard>

        {/* Não Conformidades */}
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Não Conformidades</WhiteCardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </WhiteCardHeader>
          <WhiteCardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.nonConformities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDiff(stats?.nonConformitiesDiff || 0)}
                </p>
              </>
            )}
          </WhiteCardContent>
        </WhiteCard>

        {/* Planos de Ação */}
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Planos de Ação</WhiteCardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </WhiteCardHeader>
          <WhiteCardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.actionPlans || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDiff(stats?.actionPlansDiff || 0)}
                </p>
              </>
            )}
          </WhiteCardContent>
        </WhiteCard>

        {/* Produtos Vencidos */}
        <WhiteCard>
          <WhiteCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <WhiteCardTitle className="text-sm font-medium">Produtos Vencidos</WhiteCardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </WhiteCardHeader>
          <WhiteCardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.expiredProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDiff(stats?.expiredProductsDiff || 0)}
                </p>
              </>
            )}
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