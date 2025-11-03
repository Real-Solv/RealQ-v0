"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Menu,
  Bell,
  UserCircle,
  Sun,
  Moon,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Clock,
  Eye,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase/client"
import clsx from "clsx"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false)
  const [mobileUserOpen, setMobileUserOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const mobileUserRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) { console.error(error); return }
      if (!session) { window.location.href = "/login"; return }
      setUserEmail(session.user.email ?? null)
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) { setUserEmail(session.user.email ?? null) }
        else { window.location.href = "/login" }
      })
      return () => { listener.subscription.unsubscribe() }
    }
    checkUser()
  }, [])

  // Fecha notificações e popover usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setMobileNotificationsOpen(false)
      }
      if (mobileUserRef.current && !mobileUserRef.current.contains(event.target as Node)) {
        setMobileUserOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const footerItems = [
    { title: "Qualidade", href: "/dashboard/qualidade", icon: ClipboardCheck },
    { title: "Inspeções", href: "/dashboard/inspecoes", icon: FileCheck },
    { title: "Ações", href: "/dashboard/acoes", icon: AlertTriangle },
    { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { title: "Menu", href: "#", icon: Menu },
  ]

  

  const FOOTER_HEIGHT = 80

  const notifications = [
    { icon: TrendingUp, title: "Meta alcançada", description: "Você atingiu 75% da sua meta de aposentadoria." },
    { icon: Lightbulb, title: "Nova recomendação disponível", description: "Temos uma sugestão de investimento para você." },
    { icon: DollarSign, title: "Despesa acima do esperado", description: "Seus gastos este mês estão 15% acima da média." },
    { icon: Clock, title: "Lembrete de contribuição", description: "Não esqueça de fazer sua contribuição mensal." },
    { icon: Eye, title: "Análise 360° atualizada", description: "Ver todas as notificações.", highlight: true },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 🔹 Topbar Desktop */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-background sticky top-0 z-50">
        <h1 className="text-lg font-semibold tracking-tight">Painel de Controle</h1>
        <div className="flex items-center gap-4">
          {/* Botão Tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Alternar tema"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* 🔔 Notificações Desktop com animação */}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Notificações">
      <Bell className="h-5 w-5" />
    </Button>
  </PopoverTrigger>
  <PopoverContent
    className="w-80 origin-top-right animate-slide-down-fade"
    side="bottom"
    align="end"
  >
    <div className="space-y-3">
      {notifications.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 p-2 rounded-lg ${item.highlight ? "bg-muted font-semibold" : "hover:bg-muted/60"}`}
        >
          <item.icon className="h-5 w-5 text-primary mt-1" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </PopoverContent>
</Popover>


          {/* 🔹 Usuário Desktop */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-[120px]">{userEmail ?? "Carregando..."}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              <p className="text-sm font-medium mb-2">{userEmail}</p>
              <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                Sair
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* 🔹 Topbar Mobile */}
      <header className="flex md:hidden items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-50">
        <div ref={mobileUserRef} className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2 truncate"
            onClick={() => setMobileUserOpen(prev => !prev)}
          >
            <UserCircle className="w-5 h-5" />
            <span className="truncate text-xs">{userEmail ?? "Carregando..."}</span>
          </Button>

          <div className={clsx(
            "absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md overflow-hidden transition-all duration-200 z-50",
            mobileUserOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-2 flex flex-col gap-2">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Alternar tema"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificações"
            onClick={() => setMobileNotificationsOpen(prev => !prev)}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 🔹 Notificações Mobile */}
      <div className={clsx(
        "md:hidden overflow-hidden transition-all duration-300 ease-out bg-background",
        mobileNotificationsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="flex flex-col p-2 space-y-2">
          {notifications.map((item, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-2 rounded-lg ${item.highlight ? "bg-muted font-semibold" : "hover:bg-muted/60"}`}>
              <item.icon className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Conteúdo principal */}
      <div className="flex flex-1 w-full overflow-x-hidden">
        <DashboardSidebar className="hidden md:block flex-shrink-0" isMobile={false} />
        <main className="flex-1 p-4 md:p-6 max-w-full" style={{ paddingBottom: FOOTER_HEIGHT }}>
          {children}
        </main>
      </div>

      {/* 🔹 Rodapé Mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden" style={{ height: FOOTER_HEIGHT }}>
        <nav className="flex items-center justify-between h-full px-1">
          {footerItems.map((item) =>
            item.title !== "Menu" ? (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center text-center px-1 w-[56px] sm:w-[64px]"
                >
                  <item.icon className="mb-1 w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="truncate text-xs">{item.title}</span>
                </Button>
              </Link>
            ) : (
              <Sheet key="menu" open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="flex flex-col items-center justify-center text-center px-1 w-[56px] sm:w-[64px]">
                    <Menu className="mb-1 w-6 h-6 sm:w-7 sm:h-7" />
                    <span className="truncate text-xs">Menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="pr-0 animate-slide-in-left w-[80vw] max-w-[280px] flex flex-col justify-between">
                  <DashboardSidebar isMobile={true} />
                  <div className="border-t p-4 flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    <span className="truncate text-sm">{userEmail ?? "Carregando..."}</span>
                    <Button variant="destructive" size="sm" className="ml-auto" onClick={handleLogout}>
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )
          )}
        </nav>
      </div>
    </div>
  )
}
