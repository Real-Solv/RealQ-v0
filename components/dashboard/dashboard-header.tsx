"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "@/lib/supabase/auth"
import { getCurrentUser } from "@/lib/services/user-service-extended"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; profile_image?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser({
            name: currentUser.name,
            email: currentUser.email,
            profile_image: currentUser.profile_image,
          })
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao desconectar. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* ====== Lado esquerdo ====== */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Menu lateral mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <DashboardSidebar isMobile />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RealQ
            </span>
          </Link>
        </div>

        {/* ====== Lado direito ====== */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Alternar tema */}
          <ThemeToggle />

          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-w-[90vw] p-2 sm:w-96 bg-background shadow-lg rounded-xl"
            >
              <DropdownMenuLabel className="text-lg font-semibold text-center">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ul className="space-y-3">
                <li className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="font-medium text-green-700 dark:text-green-300">🎯 Meta alcançada!</p>
                  <p className="text-sm text-muted-foreground">Você atingiu 75% da sua meta.</p>
                </li>
                <li className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300">⏰ Lembrete</p>
                  <p className="text-sm text-muted-foreground">Não esqueça de revisar seu progresso.</p>
                </li>
              </ul>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {isLoading ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Avatar className="h-8 w-8">
                    {user?.profile_image ? (
                      <AvatarImage src={user.profile_image} alt={user.name || "Usuário"} />
                    ) : null}
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || "Usuário"}
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracoes">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
