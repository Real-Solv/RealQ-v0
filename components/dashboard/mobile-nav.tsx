"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Menu,
  X,
  Package,
  Tag,
  TestTube,
  PenToolIcon as Tool,
  Users,
  Settings,
  Building,
  Truck,
  ChevronDown,
  ChevronRight,
  UserPlus,
} from "lucide-react"
import { useState } from "react"

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const mainItems = [
    {
      title: "Qualidade",
      href: "/dashboard/qualidade",
      icon: ClipboardCheck,
    },
    {
      title: "Inspeções",
      href: "/dashboard/inspecoes",
      icon: FileCheck,
    },
    {
      title: "Ações",
      href: "/dashboard/acoes",
      icon: AlertTriangle,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
  ]

  const extraItems = [
    { title: "Produtos", href: "/dashboard/produtos", icon: Package },
    { title: "Categorias", href: "/dashboard/categorias", icon: Tag },
    { title: "Testes", href: "/dashboard/testes", icon: TestTube },
    { title: "Ferramentas", href: "/dashboard/ferramentas", icon: Tool },
    { title: "Produtores", href: "/dashboard/produtores", icon: Building },
    { title: "Revendedores", href: "/dashboard/revendedores", icon: Truck },
  ]

  const sistemaItems = [
    { title: "Usuários", href: "/dashboard/usuarios", icon: Users },
    { title: "Tipos de Usuários", href: "/dashboard/tipos-usuarios", icon: UserPlus },
    { title: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  ]

  return (
    <>
      {/* Rodapé fixo */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 border-t bg-background z-20",
          className
        )}
      >
        <nav className="flex items-center justify-around">
          {mainItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.title}
            </Link>
          ))}

          {/* Botão Menu no rodapé */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium text-muted-foreground transition-colors"
          >
            <Menu className="h-5 w-5 mb-1" />
            Menu
          </button>
        </nav>
      </div>

      {/* Drawer lateral */}
      <div
        className={cn(
          "fixed inset-0 z-30 transition-all duration-300 ease-in-out",
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          className={cn(
            "absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l shadow-xl transition-transform duration-300 ease-in-out",
            menuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm text-muted-foreground">Menu</h3>
            <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-64px)]">
            {/* Seção Rápido */}
            <div>
              <button
                onClick={() => toggleSection("rapido")}
                className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground py-2"
              >
                <span>Principal</span>
                {openSection === "rapido" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openSection === "rapido" ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="flex flex-col gap-2 mt-1 pl-3">
                  {mainItems.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção Mais opções */}
            <div>
              <button
                onClick={() => toggleSection("mais")}
                className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground py-2"
              >
                <span>Gerenciamento</span>
                {openSection === "mais" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openSection === "mais" ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="flex flex-col gap-2 mt-1 pl-3">
                  {extraItems.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção Sistema */}
            <div>
              <button
                onClick={() => toggleSection("sistema")}
                className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground py-2"
              >
                <span>Sistema</span>
                {openSection === "sistema" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openSection === "sistema" ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="flex flex-col gap-2 mt-1 pl-3">
                  {sistemaItems.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
