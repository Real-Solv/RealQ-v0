"use client"

import { useState } from "react"
import { Pencil, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditNonConformityProps {
  nonConformity: {
    id: string
    description: string
    severity: string
  }
  onSave: (id: string, data: { description: string; severity: string }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  isSaving?: boolean
}

export function EditNonConformity({ 
  nonConformity, 
  onSave, 
  onDelete,
  isSaving = false 
}: EditNonConformityProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(nonConformity.description)
  const [severity, setSeverity] = useState(nonConformity.severity)

  const handleSave = async () => {
    await onSave(nonConformity.id, { description, severity })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDescription(nonConformity.description)
    setSeverity(nonConformity.severity)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(nonConformity.id)
    }
  }

  if (!isEditing) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta não conformidade? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição da não conformidade..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severidade</Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger id="severity">
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

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}