"use client"
import Link from "next/link"
import { Eye, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getNonConformities, type NonConformity } from "@/lib/services/non-conformity-service"

interface NonConformitiesListProps {
  searchTerm: string
}

export function NonConformitiesList({ searchTerm }: NonConformitiesListProps) {
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNonConformities() {
      try {
        setLoading(true)
        const data = await getNonConformities()
        console.log(data)
        setNonConformities(data)
      } catch (error) {
        console.error("Erro ao carregar não conformidades:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNonConformities()
  }, [])

  const filteredNonConformities = nonConformities.filter(
    (nc) =>
      nc.inspections?.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.inspections?.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-24">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Severidade</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Reportado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredNonConformities.length > 0 ? (
            filteredNonConformities.map((nc) => (
              <TableRow key={nc.id}>
                <TableCell className="font-medium">{nc.inspections?.products?.name || '-'}</TableCell>
                <TableCell>{nc.inspections?.batch || '-'}</TableCell>
                <TableCell>{nc.description}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      nc.severity === "Alta"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        : nc.severity === "Média"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {nc.severity}
                  </span>
                </TableCell>
                <TableCell>{formatDate(nc.created_at)}</TableCell>
                <TableCell>{nc.users?.name || nc.users?.email || '-'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/acoes/nao-conformidades/${nc.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Criar plano de ação</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhuma não conformidade encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}