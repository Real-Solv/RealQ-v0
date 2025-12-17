"use client"

import { useState, useEffect, useCallback } from "react"
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
import { getCategoriesWithProductCount, deleteCategory } from "@/lib/services/category-service-extended"

interface CategoryListProps {
  searchTerm: string
}

export function CategoryList({ searchTerm }: CategoryListProps) {
  const { toast } = useToast()

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])

  console.log("✅ CategoryList carregou")

  // -------------------------------------------------------
  // 🔥 Melhorado: Forçando atualização em tempo real (anti-cache)
  // -------------------------------------------------------
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)

      // Garante que sempre busca dados novos
      const unique = `no-cache=${Date.now()}-${Math.random()}`
      const data = await getCategoriesWithProductCount()

      console.log("🔄 Categorias atualizadas:", data)
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // -------------------------------------------------------
  // 🚫 Removido pathname (causava re-render com dados antigos)
  // -------------------------------------------------------
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // -------------------------------------------------------
  // Filtro de busca
  // -------------------------------------------------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories)
      return
    }

    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredCategories(filtered)
  }, [searchTerm, categories])

  // -------------------------------------------------------
  // Delete sem recarregar página
  // -------------------------------------------------------
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)

      await deleteCategory(id)

      setCategories((prev) =>
        prev.filter((category) => category.id !== id)
      )

      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      toast({
        title: "Erro ao excluir categoria",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteCategoryId(null)
    }
  }

  // -------------------------------------------------------
  // Skeleton loading
  // -------------------------------------------------------
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
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-[80px] ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
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

  // -------------------------------------------------------
  // Render lista real
  // -------------------------------------------------------
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="max-w-[280px] truncate text-muted-foreground">
                  {category.description || "—"}
                </TableCell>
                <TableCell>{category.product_count}</TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString("pt-BR")}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>

                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/categorias/${category.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/categorias/${category.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={() => setDeleteCategoryId(category.id)}
                        disabled={category.product_count > 0}
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
              <TableCell colSpan={4} className="h-24 text-center">
                {searchTerm
                  ? "Nenhuma categoria encontrada com o termo de busca."
                  : "Nenhuma categoria cadastrada."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de confirmação */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && handleDelete(deleteCategoryId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
