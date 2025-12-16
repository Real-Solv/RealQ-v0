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
  getTestById,
  getProductsByTestId,
  type Test,
  type ProductSummary,
} from "@/lib/services/test-service"

export default function TestDetailPage() {
  const params = useParams()
  const { toast } = useToast()

  const [test, setTest] = useState<Test | null>(null)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const testData = await getTestById(params.id as string)
        setTest(testData)

        if (testData) {
          setProducts(testData.products)
        }
      } catch (error) {
        console.error("Erro ao carregar teste:", error)
        toast({
          title: "Erro ao carregar teste",
          description: "Não foi possível carregar os detalhes do teste.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/testes">
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
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/testes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Teste não encontrado
          </h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p>O teste que você está procurando não foi encontrado.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/testes">Voltar para a lista de testes</Link>
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
            <Link href="/dashboard/testes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{test.name}</h2>
        </div>

        <Button asChild>
          <Link href={`/dashboard/testes/${test.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Teste</CardTitle>
          <CardDescription>Informações detalhadas sobre o teste</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">
              {test.description || "Sem descrição disponível."}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Data de Cadastro
            </h3>
            <p className="text-lg">
              {new Date(test.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Produtos Relacionados
            </h3>

            {products.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum produto vinculado a este teste.
              </p>
            ) : (
              <ul className="space-y-2">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.categoryName && (
                        <span className="text-sm text-muted-foreground">
                          {product.categoryName}
                        </span>
                      )}
                    
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/produtos/${product.id}`}>
                        Ver produto
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
