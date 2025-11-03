"use client"

import { useState } from "react"
import { Bell, Moon, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

// Mock de notificações
const notifications = [
  {
    icon: "🎯",
    title: "Meta alcançada",
    description: "Você atingiu 75% da sua meta de aposentadoria.",
  },
  {
    icon: "💡",
    title: "Nova recomendação disponível",
    description: "Temos uma sugestão de investimento para você.",
  },
  {
    icon: "💸",
    title: "Despesa acima do esperado",
    description: "Seus gastos este mês estão 15% acima da média.",
  },
  {
    icon: "⏰",
    title: "Lembrete de contribuição",
    description: "Não esqueça de fazer sua contribuição mensal.",
  },
  {
    icon: "📊",
    title: "Análise 360° atualizada",
    description: "👉 Ver todas as notificações.",
    highlight: true,
  },
]

export function Header({ user }: { user?: { name: string; email: string } }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    // Aqui você vai chamar seu método de logout do Supabase
    console.log("Logout do usuário...")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-md"
      )}
    >
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>

      <div className="flex items-center gap-3">
        {/* Alternar tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notificações */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificações"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-background border rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Notificações</h4>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md hover:bg-accent/60 transition-colors",
                      n.highlight && "bg-accent/40 font-semibold"
                    )}
                  >
                    <span className="text-lg">{n.icon}</span>
                    <div>
                      <p className="text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Usuário logado">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-medium">{user?.name ?? "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? "email@exemplo.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
