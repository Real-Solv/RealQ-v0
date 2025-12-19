"use client"
import Link from "next/link"
import { Eye } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getActionPlans, updateActionPlan, type ActionPlan } from "@/lib/services/action-plan-service"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ActionsListProps {
  searchTerm: string
}

export function ActionsList({ searchTerm }: ActionsListProps) {
  const [actions, setActions] = useState<ActionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadActions()
  }, [])

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

  const handleStatusChange = async (actionId: string, newStatus: string) => {
    try {
      setUpdatingStatus(actionId)
      
      const action = actions.find(a => a.id === actionId)
      if (!action) return

      await updateActionPlan(actionId, {
        description: action.description,
        status: newStatus,
        due_date: action.due_date
      })

      toast({
        title: "Status atualizado",
        description: "O status do plano de ação foi atualizado com sucesso.",
      })

      await loadActions()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do plano de ação.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

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
                  <Select
                    value={action.status}
                    onValueChange={(value) => handleStatusChange(action.id, value)}
                    disabled={updatingStatus === action.id}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="andamento">andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(action.due_date)}</TableCell>
                <TableCell>{action.users.name || action.users.email || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/inspecoes/${action.inspection_id}?tab=actionplans`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </Link>
                  </Button>
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