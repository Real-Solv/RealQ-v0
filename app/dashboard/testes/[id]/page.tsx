// app/dashboard/testes/[id]/page.tsx

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTestById } from "@/lib/services/test-service"
import type { Test } from "@/lib/services/test-service"
import { notFound } from "next/navigation"

export default async function TesteDetailPage({
  params,
}: {
  params: Promise<{ id: string }> // ✅ Promise aqui
}) {
  const { id } = await params // ✅ Await aqui

  console.log(id)

  const test = await getTestById(id)

  if (!test) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes do Teste</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/testes">Voltar</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/testes/${id}/editar`}>Editar</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{test.name}</CardTitle>
          <CardDescription>
            Informações detalhadas do teste
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
            <p className="mt-1">{test.description ?? "—"}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
            <p className="mt-1">
              {test.created_at
                ? new Date(test.created_at).toLocaleString("pt-BR")
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}