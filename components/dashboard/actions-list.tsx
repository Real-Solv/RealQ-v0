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
import { getActionPlans, type ActionPlan } from "@/lib/services/action-plan-service"

interface ActionsListProps {
  searchTerm: string
}

export function ActionsList({ searchTerm }: ActionsListProps) {
  const [actions, setActions] = useState<ActionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActions() {
      try {
        setLoading(true)
        const data = await getActionPlans()
        setActions(data)
      } catch (error) {
        console.error("Erro ao carregar planos de ação:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActions()
  }, [])

  const filteredActions = actions.filter(
    (action) =>
      action.inspections?.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.inspections?.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.inspections?.products?.name || '-'}</TableCell>
                <TableCell>{action.inspections?.batch || '-'}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      action.status === "Concluído"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : action.status === "Em andamento"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {action.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(action.due_date)}</TableCell>
                <TableCell>{action.users.name || action.users.email || '-'}</TableCell>
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
                        <Link href={`/dashboard/acoes/${action.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Atualizar status</DropdownMenuItem>
                      <DropdownMenuItem>Concluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum plano de ação encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}