// components/dashboard/revendedor-list.tsx
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
import { supabaseClient } from "@/lib/supabase/client"

interface Revendedor {
  id: string
  nome: string
  email: string
  telefone: string
  cidade: string
  created_at: string
}

interface RevendedorListProps {
  searchTerm: string
}

export function RevendedorList({ searchTerm }: RevendedorListProps) {
  const { toast } = useToast()
  const [deleteRevendedorId, setDeleteRevendedorId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [revendedores, setRevendedores] = useState<Revendedor[]>([])
  const [filteredRevendedores, setFilteredRevendedores] = useState<Revendedor[]>([])

  // Carregar revendedores do Supabase
  useEffect(() => {
    const loadRevendedores = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabaseClient
          .from("revendedores")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Erro ao carregar revendedores:", error)
          toast({
            title: "Erro ao carregar revendedores",
            description: "Não foi possível carregar a lista de revendedores.",
            variant: "destructive",
          })
        } else {
          setRevendedores(data || [])
        }
      } catch (error) {
        console.error("Erro ao carregar revendedores:", error)
        toast({
          title: "Erro ao carregar revendedores",
          description: "Não foi possível carregar a lista de revendedores.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRevendedores()
  }, [toast])

  // Filtrar revendedores com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRevendedores(revendedores)
    } else {
      const filtered = revendedores.filter(
        (revendedor) =>
          revendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (revendedor.email && revendedor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (revendedor.telefone && revendedor.telefone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (revendedor.cidade && revendedor.cidade.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredRevendedores(filtered)
    }
  }, [searchTerm, revendedores])

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      
      const { error } = await supabaseClient
        .from("revendedores")
        .delete()
        .eq("id", id)

      if (error) {
        throw error
      }

      // Atualizar a lista de revendedores após a exclusão
      setRevendedores((prevRevendedores) => 
        prevRevendedores.filter((revendedor) => revendedor.id !== id)
      )

      toast({
        title: "Revendedor excluído",
        description: "O revendedor foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir revendedor:", error)
      toast({
        title: "Erro ao excluir revendedor",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro ao excluir o revendedor. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteRevendedorId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[150px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
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
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
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
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRevendedores.length > 0 ? (
            filteredRevendedores.map((revendedor) => (
              <TableRow key={revendedor.id}>
                <TableCell className="font-medium">{revendedor.nome}</TableCell>
                <TableCell>{revendedor.email || "-"}</TableCell>
                <TableCell>{revendedor.telefone || "-"}</TableCell>
                <TableCell>{revendedor.cidade || "-"}</TableCell>
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
                        <Link href={`/dashboard/revendedores/${revendedor.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/revendedores/${revendedor.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteRevendedorId(revendedor.id)}
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
              <TableCell colSpan={5} className="h-24 text-center">
                {searchTerm ? "Nenhum revendedor encontrado com o termo de busca." : "Nenhum revendedor cadastrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteRevendedorId} onOpenChange={(open) => !open && setDeleteRevendedorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o revendedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRevendedorId && handleDelete(deleteRevendedorId)}
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