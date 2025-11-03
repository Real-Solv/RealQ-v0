"use client"

import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
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
            <p className="font-medium text-green-700 dark:text-green-300">
              🎯 Meta alcançada!
            </p>
            <p className="text-sm text-muted-foreground">
              Você atingiu 75% da sua meta de aposentadoria.
            </p>
          </li>

          <li className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="font-medium text-blue-700 dark:text-blue-300">
              💡 Nova recomendação disponível
            </p>
            <p className="text-sm text-muted-foreground">
              Temos uma sugestão de investimento para você.
            </p>
          </li>

          <li className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="font-medium text-red-700 dark:text-red-300">
              ⚠️ Despesa acima do esperado
            </p>
            <p className="text-sm text-muted-foreground">
              Seus gastos esse mês estão 15% acima da média.
            </p>
          </li>

          <li className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="font-medium text-yellow-700 dark:text-yellow-300">
              ⏰ Lembrete de contribuição
            </p>
            <p className="text-sm text-muted-foreground">
              Não esqueça de fazer sua contribuição mensal.
            </p>
          </li>

          <li className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
            <p className="font-medium text-purple-700 dark:text-purple-300">
              🔍 Análise 360° atualizada
            </p>
            <p className="text-sm text-primary font-medium cursor-pointer hover:underline">
              Ver todas as notificações
            </p>
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
