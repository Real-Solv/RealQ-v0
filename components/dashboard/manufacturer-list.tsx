"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react"

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAllManufacturers,
  deleteManufacturer,
  type Manufacturer,
} from "@/lib/services/manufacturer-service-extended"

interface ManufacturerListProps {
  searchTerm: string
}

export function ManufacturerList({ searchTerm }: ManufacturerListProps) {
  const { toast } = useToast()
  const [deleteManufacturerId, setDeleteManufacturerId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([])

  // Carregar fabricantes do Supabase
  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        setIsLoading(true)
        const data = await getAllManufacturers()
        setManufacturers(data)
      } catch (error) {
        console.error("Erro ao carregar fabricantes:", error)
        toast({
          title: "Erro ao carregar fabricantes",
          description: "Não foi possível carregar a lista de fabricantes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadManufacturers()
  }, [toast])

  // Filtrar fabricantes com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredManufacturers(manufacturers)
    } else {
      const filtered = manufacturers.filter(
        (manufacturer) =>
          manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manufacturer.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manufacturer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manufacturer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manufacturer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredManufacturers(filtered)
    }
  }, [searchTerm, manufacturers])

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await deleteManufacturer(id)

      // Atualizar a lista de fabricantes após a exclusão
      setManufacturers((prevManufacturers) => prevManufacturers.filter((manufacturer) => manufacturer.id !== id))

      toast({
        title: "Fabricante excluído",
        description: "O fabricante foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir fabricante:", error)
      toast({
        title: "Erro ao excluir fabricante",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro ao excluir o fabricante. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteManufacturerId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[150px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-[80px] ml-auto" />
                </TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredManufacturers.length > 0 ? (
            filteredManufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell className="font-medium">{manufacturer.name}</TableCell>
                <TableCell>{manufacturer.contact || "-"}</TableCell>
                <TableCell>{manufacturer.email || "-"}</TableCell>
                <TableCell>{manufacturer.phone || "-"}</TableCell>
                <TableCell>{manufacturer.address || "-"}</TableCell>
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
                        <Link href={`/dashboard/produtores/${manufacturer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/produtores/${manufacturer.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteManufacturerId(manufacturer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {searchTerm ? "Nenhum fabricante encontrado com o termo de busca." : "Nenhum fabricante cadastrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteManufacturerId} onOpenChange={(open) => !open && setDeleteManufacturerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o fabricante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteManufacturerId && handleDelete(deleteManufacturerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
