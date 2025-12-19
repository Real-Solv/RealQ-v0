"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Pencil, AlertTriangle, CheckCircle, Clock, Plus, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  WhiteCard,
  WhiteCardContent,
  WhiteCardDescription,
  WhiteCardHeader,
  WhiteCardTitle,
} from "@/components/ui/white-card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  getInspectionDetail, 
  updateInspectionTest,
  type InspectionDetail 
} from "@/lib/services/inspection-service-extended"
import { updateInspectionStatus } from "@/lib/services/inspection-service-extended"
import { updateNonConformity, deleteNonConformity } from "@/lib/services/non-conformity-service"
import { updateActionPlan, deleteActionPlan } from "@/lib/services/action-plan-service"
import { EditNonConformity } from "@/components/dashboard/edit-non-conformity"
import { EditActionPlan } from "@/components/dashboard/edit-action-plan"

export default function InspectionDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [inspection, setInspection] = useState<InspectionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [testNotes, setTestNotes] = useState<Record<string, string>>({})
  const [testPassed, setTestPassed] = useState<Record<string, boolean>>({})
  const [isSavingTest, setIsSavingTest] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [inspectionStatus, setInspectionStatus] = useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isSavingEntity, setIsSavingEntity] = useState(false)

  useEffect(() => {
    fetchInspection()
  }, [params.id])

  const fetchInspection = async () => {
    try {
      setIsLoading(true)
      const data = await getInspectionDetail(params.id as string)
      
      if (!data) {
        toast({
          title: "Inspeção não encontrada",
          description: "A inspeção solicitada não foi encontrada.",
          variant: "destructive",
        })
        return
      }

      setInspection(data)
      setInspectionStatus(data.status)
      
      // Inicializar estados dos testes
      if (data.inspection_tests) {
        const notesMap: Record<string, string> = {}
        const passedMap: Record<string, boolean> = {}
        data.inspection_tests.forEach((test) => {
          notesMap[test.id] = test.notes || ''
          passedMap[test.id] = test.passed || false
        })
        setTestNotes(notesMap)
        setTestPassed(passedMap)
      }
    } catch (error) {
      console.error('Erro ao carregar inspeção:', error)
      toast({
        title: "Erro ao carregar inspeção",
        description: "Não foi possível carregar os detalhes da inspeção.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateInspectionStatus = async () => {
    try {
      setIsUpdatingStatus(true)
      
      await updateInspectionStatus(params.id as string, inspectionStatus as any)

      toast({
        title: "Status atualizado",
        description: "O status da inspeção foi atualizado com sucesso.",
      })
      
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da inspeção.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSaveTest = async (testId: string) => {
    try {
      setIsSavingTest(true)
      
      await updateInspectionTest(testId, {
        notes: testNotes[testId],
        passed: testPassed[testId],
        result: testPassed[testId] ? 'Aprovado' : 'Reprovado'
      })

      toast({
        title: "Teste atualizado",
        description: "O resultado do teste foi atualizado com sucesso.",
      })
      
      setEditingTest(null)
      setActiveTab("tests")
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao atualizar teste:', error)
      toast({
        title: "Erro ao atualizar teste",
        description: "Não foi possível atualizar o resultado do teste.",
        variant: "destructive",
      })
    } finally {
      setIsSavingTest(false)
    }
  }

  const handleCancelEdit = (testId: string) => {
    const originalTest = inspection?.inspection_tests.find(t => t.id === testId)
    if (originalTest) {
      setTestNotes(prev => ({ ...prev, [testId]: originalTest.notes || '' }))
      setTestPassed(prev => ({ ...prev, [testId]: originalTest.passed || false }))
    }
    setEditingTest(null)
  }

  const handleSaveNonConformity = async (id: string, data: { description: string; severity: string }) => {
    try {
      setIsSavingEntity(true)
      await updateNonConformity(id, data)
      
      toast({
        title: "Não conformidade atualizada",
        description: "A não conformidade foi atualizada com sucesso.",
      })
      
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao atualizar não conformidade:', error)
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a não conformidade.",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntity(false)
    }
  }

  const handleDeleteNonConformity = async (id: string) => {
    try {
      setIsSavingEntity(true)
      await deleteNonConformity(id)
      
      toast({
        title: "Não conformidade excluída",
        description: "A não conformidade foi excluída com sucesso.",
      })
      
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao excluir não conformidade:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a não conformidade.",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntity(false)
    }
  }

  const handleSaveActionPlan = async (id: string, data: { description: string; status: string; due_date: string }) => {
    try {
      setIsSavingEntity(true)
      await updateActionPlan(id, data)
      
      toast({
        title: "Plano de ação atualizado",
        description: "O plano de ação foi atualizado com sucesso.",
      })
      
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao atualizar plano de ação:', error)
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o plano de ação.",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntity(false)
    }
  }

  const handleDeleteActionPlan = async (id: string) => {
    try {
      setIsSavingEntity(true)
      await deleteActionPlan(id)
      
      toast({
        title: "Plano de ação excluído",
        description: "O plano de ação foi excluído com sucesso.",
      })
      
      await fetchInspection()
    } catch (error) {
      console.error('Erro ao excluir plano de ação:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o plano de ação.",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntity(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado": return <Badge className="bg-green-500">Aprovado</Badge>
      case "Pendente": return <Badge className="bg-yellow-500">Pendente</Badge>
      case "Incompleto": return <Badge className="bg-blue-500">Incompleto</Badge>
      case "Reprovado": return <Badge className="bg-red-500">Reprovado</Badge>
      case "Vencido": return <Badge className="bg-red-500">Vencido</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "baixa": return <Badge className="bg-blue-500">Baixa</Badge>
      case "média": return <Badge className="bg-yellow-500">Média</Badge>
      case "alta": return <Badge className="bg-orange-500">Alta</Badge>
      case "crítica": return <Badge className="bg-red-500">Crítica</Badge>
      default: return <Badge>{severity}</Badge>
    }
  }

  const getActionStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluído": return <Badge className="bg-green-500">Concluído</Badge>
      case "em andamento": return <Badge className="bg-blue-500">Em andamento</Badge>
      case "pendente": return <Badge className="bg-yellow-500">Pendente</Badge>
      case "atrasado": return <Badge className="bg-red-500">Atrasado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getTestResultBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-500">Aprovado</Badge>
    ) : (
      <Badge className="bg-red-500">Reprovado</Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inspecoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Skeleton className="h-10 w-[250px]" />
        </div>
        <WhiteCard>
          <WhiteCardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </WhiteCardHeader>
          <WhiteCardContent className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </WhiteCardContent>
        </WhiteCard>
      </div>
    )
  }

  if (!inspection) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inspecoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Inspeção não encontrada</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inspecoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{inspection.product.name}</h2>
            <p className="text-muted-foreground">Lote: {inspection.batch}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/inspecoes/${inspection.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/inspecoes/${inspection.id}/nao-conformidade/nova`}>
              <Plus className="mr-2 h-4 w-4" />Registrar Não Conformidade
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="nonconformities">Não Conformidades</TabsTrigger>
          <TabsTrigger value="actionplans">Planos de Ação</TabsTrigger>
        </TabsList>

        {/* Tab Detalhes */}
        <TabsContent value="details">
          <WhiteCard>
            <WhiteCardHeader>
              <div className="flex flex-row justify-between items-start">
                <div>
                  <WhiteCardTitle>Informações da Inspeção</WhiteCardTitle>
                  <WhiteCardDescription>Detalhes da inspeção do produto</WhiteCardDescription>
                </div>
                {getStatusBadge(inspection.status)}
              </div>
            </WhiteCardHeader>
            <WhiteCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Produto</h3>
                    <p className="text-lg">{inspection.product.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lote</h3>
                    <p className="text-lg">{inspection.batch}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Revendedor</h3>
                    <p className="text-lg">{inspection.revendedor.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Fabricante</h3>
                    <p className="text-lg">{inspection.manufacturer.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Chegada</h3>
                    <p className="text-lg">{formatDate(inspection.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Validade</h3>
                    <p className="text-lg">{formatDate(inspection.expiry_date)}</p>
                  </div>
                </div>

                {inspection.photos && inspection.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inspection.photos.map((photo, index) => (
                      <Image
                        key={index}
                        src={photo.startsWith("http") ? photo : `/uploads/${photo}`}
                        alt={`Foto da inspeção ${index + 1}`}
                        width={400}
                        height={400}
                        className="rounded-md object-cover shadow"
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Características do Produto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {inspection.color && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Cor</h4>
                      <p>{inspection.color}</p>
                    </div>
                  )}
                  {inspection.odor && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Odor</h4>
                      <p>{inspection.odor}</p>
                    </div>
                  )}
                  {inspection.appearance && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Aspecto</h4>
                      <p>{inspection.appearance}</p>
                    </div>
                  )}
                  {inspection.texture && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Textura</h4>
                      <p>{inspection.texture}</p>
                    </div>
                  )}
                  {inspection.temperature !== null && inspection.temperature !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Temperatura</h4>
                      <p>{inspection.temperature}°C</p>
                    </div>
                  )}
                  {inspection.humidity !== null && inspection.humidity !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Umidade</h4>
                      <p>{inspection.humidity}%</p>
                    </div>
                  )}
                </div>
              </div>
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>

        {/* Tab Testes */}
        <TabsContent value="tests">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Testes Realizados</WhiteCardTitle>
              <WhiteCardDescription>Resultados dos testes realizados na inspeção</WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent className="space-y-6">
              {/* Controle de Status da Inspeção */}
              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="text-lg font-semibold mb-4">Status da Inspeção</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="inspection-status">Status</Label>
                    <Select value={inspectionStatus} onValueChange={setInspectionStatus}>
                      <SelectTrigger id="inspection-status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Reprovado">Reprovado</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Incompleto">Incompleto</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleUpdateInspectionStatus}
                    disabled={isUpdatingStatus || inspectionStatus === inspection.status}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdatingStatus ? 'Salvando...' : 'Atualizar Status'}
                  </Button>
                </div>
              </div>

              <Separator />

              {inspection.inspection_tests && inspection.inspection_tests.length > 0 ? (
                <div className="space-y-4">
                  {inspection.inspection_tests.map((test) => (
                    <div key={test.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{test.test.name}</h3>
                        {getTestResultBadge(test.passed)}
                      </div>

                      {editingTest === test.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`passed-${test.id}`}
                              checked={testPassed[test.id]}
                              onCheckedChange={(checked) =>
                                setTestPassed(prev => ({ ...prev, [test.id]: checked as boolean }))
                              }
                            />
                            <Label htmlFor={`passed-${test.id}`} className="text-sm font-medium">
                              Teste aprovado
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`notes-${test.id}`}>Observações</Label>
                            <Textarea
                              id={`notes-${test.id}`}
                              value={testNotes[test.id]}
                              onChange={(e) =>
                                setTestNotes(prev => ({ ...prev, [test.id]: e.target.value }))
                              }
                              placeholder="Adicione observações sobre o teste..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveTest(test.id)}
                              disabled={isSavingTest}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              {isSavingTest ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelEdit(test.id)}
                              disabled={isSavingTest}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {test.notes && (
                            <p className="text-muted-foreground">{test.notes}</p>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTest(test.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Resultado
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum teste registrado</h3>
                  <p className="text-muted-foreground mb-4">Não há testes registrados para esta inspeção.</p>
                </div>
              )}
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>

        {/* Tab Não Conformidades */}
        <TabsContent value="nonconformities">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Não Conformidades</WhiteCardTitle>
              <WhiteCardDescription>Não conformidades identificadas na inspeção</WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              {inspection.non_conformities && inspection.non_conformities.length > 0 ? (
                <div className="space-y-4">
                  {inspection.non_conformities.map((nc) => (
                    <div key={nc.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">Não Conformidade</h3>
                        {getSeverityBadge(nc.severity)}
                      </div>
                      <p className="mb-2">{nc.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Registrada em: {formatDate(nc.created_at)}
                      </p>
                      
                      <EditNonConformity
                        nonConformity={nc}
                        onSave={handleSaveNonConformity}
                        onDelete={handleDeleteNonConformity}
                        isSaving={isSavingEntity}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma não conformidade</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há não conformidades registradas para esta inspeção.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/inspecoes/${inspection.id}/nao-conformidade/nova`}>
                      Registrar Não Conformidade
                    </Link>
                  </Button>
                </div>
              )}
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>

        {/* Tab Planos de Ação */}
        <TabsContent value="actionplans">
          <WhiteCard>
            <WhiteCardHeader>
              <WhiteCardTitle>Planos de Ação</WhiteCardTitle>
              <WhiteCardDescription>Planos de ação relacionados a esta inspeção</WhiteCardDescription>
            </WhiteCardHeader>
            <WhiteCardContent>
              {inspection.action_plans && inspection.action_plans.length > 0 ? (
                <div className="space-y-4">
                  {inspection.action_plans.map((plan) => (
                    <div key={plan.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">Plano de Ação</h3>
                        {getActionStatusBadge(plan.status)}
                      </div>
                      <p className="mb-2">{plan.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Prazo: {formatDate(plan.due_date)}
                      </p>
                      
                      <EditActionPlan
                        actionPlan={plan}
                        onSave={handleSaveActionPlan}
                        onDelete={handleDeleteActionPlan}
                        isSaving={isSavingEntity}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum plano de ação</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há planos de ação registrados para esta inspeção.
                  </p>
                </div>
              )}
            </WhiteCardContent>
          </WhiteCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}