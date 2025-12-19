"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserId, createNonConformityWithActionPlan } from "@/lib/services/inspection-service-extended"

export default function NewNonConformityPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados do formulário
  const [ncDescription, setNcDescription] = useState("")
  const [ncSeverity, setNcSeverity] = useState("Média")
  const [apDescription, setApDescription] = useState("")
  const [apStatus, setApStatus] = useState("Pendente")
  const [apDueDate, setApDueDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ncDescription.trim()) {
      toast({
        title: "Erro de validação",
        description: "A descrição da não conformidade é obrigatória.",
        variant: "destructive",
      })
      return
    }

    if (!apDescription.trim() || !apDueDate) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos do plano de ação são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error("Usuário não autenticado")
      }

      await createNonConformityWithActionPlan(
        {
          inspection_id: params.id as string,
          description: ncDescription,
          severity: ncSeverity,
          created_by: userId,
        },
        {
          inspection_id: params.id as string,
          description: apDescription,
          status: apStatus,
          due_date: apDueDate,
          created_by: userId,
        }
      )

      toast({
        title: "Sucesso",
        description: "Não conformidade e plano de ação criados com sucesso.",
      })

      router.push(`/dashboard/inspecoes/${params.id}`)
    } catch (error) {
      console.error("Erro ao criar não conformidade:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a não conformidade e o plano de ação.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/inspecoes/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Registrar Não Conformidade
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Não Conformidade */}
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Informações da Não Conformidade</WhiteCardTitle>
              <WhiteCardDescription>
                Descreva a não conformidade identificada
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nc-description">Descrição *</Label>
                <Textarea
                  id="nc-description"
                  value={ncDescription}
                  onChange={(e) => setNcDescription(e.target.value)}
                  placeholder="Descreva detalhadamente a não conformidade identificada..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nc-severity">Severidade *</Label>
                <Select value={ncSeverity} onValueChange={setNcSeverity}>
                  <SelectTrigger id="nc-severity">
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </WhiteCardContent>
          </WhiteCard>

          {/* Plano de Ação */}
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Plano de Ação</WhiteCardTitle>
              <WhiteCardDescription>
                Defina as ações para resolver a não conformidade
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ap-description">Descrição da Ação *</Label>
                <Textarea
                  id="ap-description"
                  value={apDescription}
                  onChange={(e) => setApDescription(e.target.value)}
                  placeholder="Descreva as ações que serão tomadas..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ap-status">Status *</Label>
                  <Select value={apStatus} onValueChange={setApStatus}>
                    <SelectTrigger id="ap-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ap-due-date">Data de Vencimento *</Label>
                  <Input
                    id="ap-due-date"
                    type="date"
                    value={apDueDate}
                    onChange={(e) => setApDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </WhiteCardContent>
          </WhiteCard>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/inspecoes/${params.id}`)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Não Conformidade"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}