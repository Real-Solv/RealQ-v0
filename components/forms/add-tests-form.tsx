"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { addTestsToInspection, getAvailableTests } from "@/lib/services/inspection-service-extended"
import { Skeleton } from "@/components/ui/skeleton"
import { inspect } from "util"

interface AddTestsFormProps {
  inspection: any
  onComplete: () => void
}

export function AddTestsForm({ inspection, onComplete }: AddTestsFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [availableTests, setAvailableTests] = useState<any[]>([])

  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [testResults, setTestResults] = useState<Record<string, { result: string; notes: string }>>({})

  // Carregar testes disponíveis
  useEffect(() => {
    const loadTests = async () => {
      try {
        setIsLoading(true)
        const tests = await getAvailableTests(inspection.product.id)
        setAvailableTests(tests)
      } catch (error) {
        console.error("Erro ao carregar testes:", error)
        toast({
          title: "Erro ao carregar testes",
          description: "Não foi possível carregar a lista de testes disponíveis.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTests()
  }, [toast])

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      setSelectedTests((prev) => [...prev, testId])
      setTestResults((prev) => ({
        ...prev,
        [testId]: { result: "", notes: "" },
      }))
    } else {
      setSelectedTests((prev) => prev.filter((id) => id !== testId))
      setTestResults((prev) => {
        const newResults = { ...prev }
        delete newResults[testId]
        return newResults
      })
    }
  }

  const handleResultChange = (testId: string, field: "result" | "notes", value: string) => {
    setTestResults((prev) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar dados para envio
      const testsToAdd = selectedTests.map((testId) => ({
        testId,
        result: testResults[testId].result,
        notes: testResults[testId].notes,
      }))

      // Salvar no Supabase
      await addTestsToInspection(inspection.id, testsToAdd)

      toast({
        title: "Testes adicionados",
        description: "Os testes foram adicionados com sucesso à inspeção.",
      })

      onComplete()
    } catch (error) {
      console.error("Erro ao adicionar testes:", error)
      toast({
        title: "Erro ao adicionar testes",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro ao adicionar os testes. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Selecione os testes a serem realizados</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-4">
            {availableTests.length > 0 ? (
              availableTests.map((test) => (
                <div key={test.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`test-${test.id}`}
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`test-${test.id}`} className="text-sm font-medium">
                      {test.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{test.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground col-span-2 text-center py-4">
                Nenhum teste disponível. Cadastre testes primeiro.
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedTests.length > 0 && (
        <div className="space-y-4">
          <Label>Resultados dos testes selecionados</Label>
          <div className="space-y-6">
            {selectedTests.map((testId) => {
              const test = availableTests.find((t) => t.id === testId)
              if (!test) return null

              return (
                <div key={testId} className="border rounded-md p-4 space-y-3">
                  <h3 className="font-medium">{test.name}</h3>

                  <div className="space-y-2">
                    <Label htmlFor={`result-${testId}`}>Resultado</Label>
                    <Input
                      id={`result-${testId}`}
                      value={testResults[testId]?.result || ""}
                      onChange={(e) => handleResultChange(testId, "result", e.target.value)}
                      placeholder="Digite o resultado do teste"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${testId}`}>Observações</Label>
                    <Textarea
                      id={`notes-${testId}`}
                      value={testResults[testId]?.notes || ""}
                      onChange={(e) => handleResultChange(testId, "notes", e.target.value)}
                      placeholder="Observações sobre o teste"
                      rows={2}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || selectedTests.length === 0 || availableTests.length === 0}>
          {isSubmitting ? "Salvando..." : "Salvar Testes"}
        </Button>
      </div>
    </form>
  )
}
