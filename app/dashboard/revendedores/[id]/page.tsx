"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  getRevendedorById,
  type Revendedor,
} from "@/lib/services/revendedores-service"

export default function RevendedorDetailPage() {
  const params = useParams()
  const { toast } = useToast()

  const [revendedor, setRevendedor] = useState<Revendedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRevendedor = async () => {
      try {
        setIsLoading(true)
        const data = await getRevendedorById(params.id as string)
        setRevendedor(data)
      } catch (error) {
        console.error("Erro ao carregar revendedor:", error)
        toast({
          title: "Erro ao carregar revendedor",
          description: "Não foi possível carregar os detalhes do revendedor.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevendedor()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/revendedores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <Skeleton className="h-10 w-[250px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-6 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!revendedor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/revendedores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Revendedor não encontrado
          </h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p>O revendedor que você está procurando não foi encontrado.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/revendedores">
                Voltar para a lista de revendedores
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/revendedores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {revendedor.nome}
          </h2>
        </div>

        <Button asChild>
          <Link href={`/dashboard/revendedores/${revendedor.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Revendedor</CardTitle>
          <CardDescription>
            Informações detalhadas sobre o revendedor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contato</h3>
            <p className="text-muted-foreground">
              {revendedor.email || "Email não informado"}
            </p>
            <p className="text-muted-foreground">
              {revendedor.telefone || "Telefone não informado"}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Cidade
              </h3>
              <p className="text-lg">
                {revendedor.cidade || "Não informada"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Data de Cadastro
              </h3>
              <p className="text-lg">
                {revendedor.created_at
                  ? new Date(revendedor.created_at).toLocaleDateString("pt-BR")
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
