"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

import { getAllInspections, type InspectionListItem } from "@/lib/services/inspection-service-extended"

interface InspectionListProps {
  searchTerm: string
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase()
  
  if (statusLower === "pendente") {
    return "bg-yellow-100 text-yellow-800"
  } else if (statusLower === "incompleto") {
    return "bg-orange-100 text-orange-800"
  } else if (statusLower === "vencido") {
    return "bg-red-100 text-red-800"
  } else if (statusLower === "aprovado") {
    return "bg-green-100 text-green-800"
  }
  
  return "bg-muted"
}

export function InspectionList({ searchTerm }: InspectionListProps) {
  const [inspections, setInspections] = useState<InspectionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInspections() {
      try {
        const data = await getAllInspections()
        console.log(data)
        setInspections(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadInspections()
  }, [])

  const filteredInspections = inspections.filter(
    (inspection) =>
      inspection.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        Carregando inspeções...
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
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/inspecoes/${inspection.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Completar inspeção</DropdownMenuItem>
                      <DropdownMenuItem>Adicionar testes</DropdownMenuItem>
                      <DropdownMenuItem>Registrar não conformidade</DropdownMenuItem>
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
  )
}