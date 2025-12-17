"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createCategory } from "@/lib/services/category-service-extended"

export default function NewCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createCategory({
        name,
        description,
      })

      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      })

      router.push("/dashboard/categorias")
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      toast({
        title: "Erro ao criar categoria",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao criar a categoria.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/categorias">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nova Categoria</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Categoria</CardTitle>
          <CardDescription>
            Preencha os dados para cadastrar uma nova categoria
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">

              {/* Nome */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome da categoria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da categoria (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Categoria"
                )}
              </Button>

              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/categorias">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
