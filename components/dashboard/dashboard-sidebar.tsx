"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ClipboardCheck,
  FileCheck,
  Package,
  Tag,
  TestTube,
  PenToolIcon as Tool,
  Users,
  Settings,
  Building,
  Truck,
  AlertTriangle,
} from "lucide-react"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface DashboardSidebarProps {
  className?: string
  isMobile?: boolean
}

export function DashboardSidebar({ className, isMobile = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navSections = [
    {
      title: "Principal",
      items: [
        { title: "Qualidade", href: "/dashboard/qualidade", icon: ClipboardCheck },
        { title: "Inspeções", href: "/dashboard/inspecoes", icon: FileCheck },
        { title: "Ações", href: "/dashboard/acoes", icon: AlertTriangle },
        { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
      ],
    },
    {
      title: "Gerenciamento",
      items: [
        { title: "Produtos", href: "/dashboard/produtos", icon: Package },
        { title: "Categorias", href: "/dashboard/categorias", icon: Tag },
        { title: "Testes", href: "/dashboard/testes", icon: TestTube },
        { title: "Ferramentas", href: "/dashboard/ferramentas", icon: Tool },
        { title: "Produtores", href: "/dashboard/produtores", icon: Building },
        { title: "Revendedores", href: "/dashboard/revendedores", icon: Truck },
      ],
    },
    {
      title: "Sistema",
      items: [
        { title: "Usuários", href: "/dashboard/usuarios", icon: Users },
        { title: "Tipos de Usuários", href: "/dashboard/tipos-usuarios", icon: Users },
        { title: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
      ],
    },
  ]

  // Mobile: usa Accordion, Desktop: lista fixa sem Accordion
  if (isMobile) {
    return (
      <nav className={cn("flex flex-col gap-4 p-4 h-full border-r overflow-y-auto", className)}>
        <Accordion type="multiple" className="w-full">
          {navSections.map((section) => (
            <AccordionItem key={section.title} value={section.title}>
              <AccordionTrigger className="text-sm font-semibold">{section.title}</AccordionTrigger>
              <AccordionContent className="pl-2">
                <ul className="space-y-1 mt-1">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    )
  }

  // Desktop: sidebar fixa sem Accordion
  return (
    <nav className={cn("flex flex-col gap-4 p-4 h-full border-r", className)}>
      {navSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-muted-foreground px-2">{section.title}</h3>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
