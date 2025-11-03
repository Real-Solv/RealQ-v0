"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, MoreHorizontal, Loader2, Shield } from "lucide-react"

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
import { getAllUsers, deleteUser, type User } from "@/lib/services/user-service-extended"
import { Badge } from "@/components/ui/badge"

interface UserListProps {
  searchTerm: string
}

export function UserList({ searchTerm }: UserListProps) {
  const { toast } = useToast()
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  // 🔹 Carregar usuários do Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const data = await getAllUsers()
        setUsers(data)
      } catch (error: any) {
        console.error("Erro ao carregar usuários:", error)
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [toast])

  // 🔹 Filtrar usuários com base no termo de busca (otimizado com useMemo)
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
    )
  }, [searchTerm, users])

  // 🔹 Função de exclusão com useCallback (mantém referência estável)
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true)
        await deleteUser(id)
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))

        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso.",
        })
      } catch (error: any) {
        console.error("Erro ao excluir usuário:", error)
        toast({
          title: "Erro ao excluir usuário",
          description:
            error instanceof Error
              ? error.message
              : "Ocorreu um erro ao excluir o usuário. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
        setDeleteUserId(null)
      }
    },
    [toast]
  )

  // 🔹 Exibir tipo de usuário como badge
  const getUserTypeBadge = (userType?: string) => {
    if (!userType) return <Badge>Indefinido</Badge>

    const types: Record<string, { label: string; color: string }> = {
      "admin-user": { label: "Administrador", color: "bg-red-500" },
      "manager-user": { label: "Gestor", color: "bg-orange-500" },
      "quality-user": { label: "Profissional QA", color: "bg-blue-500" },
      "viewer-user": { label: "Visualizador", color: "bg-green-500" },
    }

    const type = types[userType]
    return <Badge className={type?.color ?? "bg-gray-500"}>{type?.label ?? userType}</Badge>
  }

  // 🔹 Estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {["Nome", "Email", "Telefone", "Tipo", "Ações"].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // 🔹 Render principal
  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
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
                        <Link href={`/dashboard/usuarios/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/usuarios/${user.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/usuarios/${user.id}/permissoes`}>
                          <Shield className="mr-2 h-4 w-4" /> Permissões
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {searchTerm
                  ? "Nenhum usuário encontrado com o termo de busca."
                  : "Nenhum usuário cadastrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 🔹 Confirmação de exclusão */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
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
