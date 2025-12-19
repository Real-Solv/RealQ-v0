"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getRecentInspections, type RecentInspection } from "@/lib/services/dashboard-service"

export function RecentInspections() {
  const [inspections, setInspections] = useState<RecentInspection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRecentInspections()
        console.log(data)
        setInspections(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando inspeções...</p>
  }

  if (inspections.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma inspeção encontrada.</p>
  }

  return (
    <div className="space-y-8">
      {inspections.map((inspection) => {
        const inspectorInitial =
          inspection.user?.name?.charAt(0).toUpperCase() ?? "?"

        return (
          <div key={inspection.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{inspectorInitial}</AvatarFallback>
            </Avatar>

            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {inspection.products.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Lote: {inspection.batch}
              </p>
            </div>

            <div className="ml-auto font-medium">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  inspection.status === "Aprovado"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : inspection.status === "Pendente"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {inspection.status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
