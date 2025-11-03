"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { QualityInspectionList } from "@/components/dashboard/quality-inspection-list";

export default function QualityPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Qualidade</h2>
          <p className="text-muted-foreground">
            Gerencie as inspeções de qualidade pendentes e incompletas
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button asChild>
            <Link href="/dashboard/qualidade/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Qualidade
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Buscar por produto, lote ou fornecedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline">Filtrar</Button>
          <Button variant="outline">Exportar</Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">QA Pendente</TabsTrigger>
          <TabsTrigger value="incomplete">QA Incompleto</TabsTrigger>
          <TabsTrigger value="expired">Vencidos</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Inspeções Pendentes</WhiteCardTitle>
              <WhiteCardDescription>
                Inspeções que aguardam análise avançada de qualidade
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              <QualityInspectionList type="pending" searchTerm={searchTerm} />
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>
        <TabsContent value="incomplete" className="space-y-4">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Inspeções Incompletas</WhiteCardTitle>
              <WhiteCardDescription>
                Inspeções com informações faltantes ou testes incompletos
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              <QualityInspectionList
                type="incomplete"
                searchTerm={searchTerm}
              />
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>
        <TabsContent value="expired" className="space-y-4">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Produtos Vencidos</WhiteCardTitle>
              <WhiteCardDescription>
                Produtos com data de validade expirada ainda em estoque
              </WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              <QualityInspectionList type="expired" searchTerm={searchTerm} />
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
