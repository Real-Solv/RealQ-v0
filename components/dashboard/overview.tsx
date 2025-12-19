"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getInspectionsForOverview } from "@/lib/services/dashboard-service"

type ChartData = {
  name: string
  total: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const barSize = Math.max(20, Math.min(60, 400 / data.length))

  useEffect(() => {
    async function loadData() {
      try {
        const inspections = await getInspectionsForOverview()
        console.log(inspections)
        const dates = inspections.map(i => i.created_at)
        console.log(dates)
        const groupedData = groupInspectionsByFiveDays(dates)
        console.log(groupedData)
        setData(groupedData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando gráfico...</p>
  }
  function groupInspectionsByFiveDays(dates: string[]) {
    const buckets: Record<string, number> = {}
    const today = new Date()

    dates.forEach(dateStr => {
      const date = new Date(dateStr)

      const day = date.getDate()
      const month = date.getMonth()
      const year = date.getFullYear()

      // Final teórico do intervalo de 5 dias
      const bucketEndDay = Math.ceil(day / 5) * 5

      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
      let finalDay = Math.min(bucketEndDay, lastDayOfMonth)

      // 🔒 NÃO permitir datas futuras
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        finalDay > today.getDate()
      ) {
        finalDay = today.getDate()
      }

      const bucketDate = new Date(year, month, finalDay)

      const label = bucketDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })

      buckets[label] = (buckets[label] || 0) + 1
    })

    return Object.entries(buckets)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => {
        const [da, ma] = a.name.split("/").map(Number)
        const [db, mb] = b.name.split("/").map(Number)
        return ma !== mb ? ma - mb : da - db
      })
  }
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        barCategoryGap="15%"
      >
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar
          dataKey="total"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>

  )
}
