"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Pencil, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getProductById, type ProductWithCategory } from "@/lib/services/product-service-extended"
import { getInspectionsByProductId, type InspectionByProduct } from "@/lib/services/inspection-service-extended"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ProductDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithCategory | null>(null)
  const [inspections, setInspections] = useState<InspectionByProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingInspections, setIsLoadingInspections] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const productData = await getProductById(params.id as string)
        setProduct(productData)
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível carregar os detalhes do produto.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchInspections = async () => {
      try {
        setIsLoadingInspections(true)
        const inspectionsData = await getInspectionsByProductId(params.id as string)
        setInspections(inspectionsData)
      } catch (error) {
        console.error("Erro ao carregar inspeções:", error)
      } finally {
        setIsLoadingInspections(false)
      }
    }

    fetchProduct()
    fetchInspections()
  }, [params.id, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado":
        return <Badge className="bg-green-500">Aprovado</Badge>
      case "Pendente":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case "Incompleto":
        return <Badge className="bg-blue-500">Incompleto</Badge>
      case "Reprovado":
        return <Badge className="bg-red-500">Reprovado</Badge>
      case "Vencido":
        return <Badge className="bg-red-500">Vencido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/produtos">
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
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-6 w-[150px]" />
              </div>
              <div>
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-6 w-[150px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/produtos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Produto não encontrado</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p>O produto que você está procurando não foi encontrado.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/produtos">Voltar para a lista de produtos</Link>
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
            <Link href="/dashboard/produtos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
        </div>
        <Button asChild>
          <Link href={`/dashboard/produtos/${product.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Produto</CardTitle>
          <CardDescription>Informações detalhadas sobre o produto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">{product.description || "Sem descrição disponível."}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Categoria</h3>
              <p className="text-lg">{product.category?.name || "Sem categoria"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Cadastro</h3>
              <p className="text-lg">{new Date(product.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Inspeções Recentes</h3>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/inspecoes">Ver todas</Link>
              </Button>
            </div>

            {isLoadingInspections ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : inspections.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revendedor</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Data de Validade</TableHead>
                      <TableHead>Data de Inspeção</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-medium">{inspection.batch}</TableCell>
                        <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                        <TableCell>{inspection.revendedor?.name || '-'}</TableCell>
                        <TableCell>{inspection.manufacturer?.name || '-'}</TableCell>
                        <TableCell>{formatDate(inspection.expiry_date)}</TableCell>
                        <TableCell>{formatDate(inspection.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/inspecoes/${inspection.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">Nenhuma inspeção registrada para este produto.</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/inspecoes/nova">Nova Inspeção</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}