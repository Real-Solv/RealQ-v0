"use client"
import { useEffect, useState } from "react"
import { Eye, MoreHorizontal } from "lucide-react"

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
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CompleteInspectionForm } from "../forms/complete-inspection-form"
import { AddTestsForm } from "../forms/add-tests-form"
import { NonConformityForm } from "../forms/non-conformity-form"
import { getAllInspections, type InspectionListItem } from "@/lib/services/inspection-service-extended"

interface QualityInspectionListProps {
  type: "pending" | "incomplete" | "expired"
  searchTerm: string
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase()
  
  if (statusLower === "pendente") {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  } else if (statusLower === "incompleto") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
  } else if (statusLower === "vencido") {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  } else if (statusLower === "aprovado") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  }
  
  return "bg-muted"
}

export function QualityInspectionList({ type, searchTerm }: QualityInspectionListProps) {
  const router = useRouter()
  const [selectedInspection, setSelectedInspection] = useState<any>(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [testsDialogOpen, setTestsDialogOpen] = useState(false)
  const [nonConformityDialogOpen, setNonConformityDialogOpen] = useState(false)
  const [inspections, setInspections] = useState<InspectionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInspections() {
      try {
        const data = await getAllInspections()
        setInspections(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadInspections()
  }, [])

  // Filtra inspeções por tipo
  const filteredByType = inspections.filter((inspection) => {
    const statusLower = inspection.status.toLowerCase()
    console.log(statusLower)
    
    // Mapeia o tipo da prop para o status no banco
    if (type === "pending") return statusLower === "pendente"
    if (type === "incomplete") return statusLower === "incompleto"
    if (type === "expired") return statusLower === "vencido"
    
    return false
  })

  // Filtra por termo de busca
  const filteredInspections = filteredByType.filter(
    (inspection) =>
      inspection.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (inspection: any) => {
    router.push(`/dashboard/inspecoes/${inspection.id}`)
  }

  const handleCompleteInspection = (inspection: any) => {
    setSelectedInspection(inspection)
    setCompleteDialogOpen(true)
  }

  const handleAddTests = (inspection: any) => {
    setSelectedInspection(inspection)
    setTestsDialogOpen(true)
  }

  const handleNonConformity = (inspection: any) => {
    setSelectedInspection(inspection)
    setNonConformityDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        Carregando inspeções...
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data de Chegada</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.length > 0 ? (
              filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">{inspection.product.name}</TableCell>
                  <TableCell>{inspection.batch}</TableCell>
                  <TableCell>{inspection.supplier.nome}</TableCell>
                  <TableCell>
                    {new Date(inspection.arrivalDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {new Date(inspection.expiryDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(inspection.status)}`}>
                      {inspection.status}
                    </span>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(inspection)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCompleteInspection(inspection)}>
                          Completar inspeção
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddTests(inspection)}>Adicionar testes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNonConformity(inspection)}>
                          Registrar não conformidade
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma inspeção encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para completar inspeção */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Completar Inspeção</DialogTitle>
            <DialogDescription>
              Complete os dados da inspeção para o produto {selectedInspection?.product?.name} (Lote:{" "}
              {selectedInspection?.batch})
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <CompleteInspectionForm inspection={selectedInspection} onComplete={() => setCompleteDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar testes */}
      <Dialog open={testsDialogOpen} onOpenChange={setTestsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Testes</DialogTitle>
            <DialogDescription>
              Adicione testes para a inspeção do produto {selectedInspection?.product?.name} (Lote:{" "}
              {selectedInspection?.batch})
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <AddTestsForm inspection={selectedInspection} onComplete={() => setTestsDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar não conformidade */}
      <Dialog open={nonConformityDialogOpen} onOpenChange={setNonConformityDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registrar Não Conformidade</DialogTitle>
            <DialogDescription>
              Registre uma não conformidade para o produto {selectedInspection?.product?.name} (Lote:{" "}
              {selectedInspection?.batch})
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <NonConformityForm inspection={selectedInspection} onComplete={() => setNonConformityDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}