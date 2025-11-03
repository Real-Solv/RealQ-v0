import { supabaseClient } from "@/lib/supabase/client";

// Tipo para a ferramenta
export interface Tool {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Função para obter todas as ferramentas
export async function getAllTools(): Promise<Tool[]> {
  try {
    const { data, error } = await supabaseClient
      .from("tools")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao buscar ferramentas:", error.message);
      throw new Error("Não foi possível obter as ferramentas.");
    }

    return data || [];
  } catch (error) {
    console.error("Erro inesperado ao buscar ferramentas:", error);
    throw error;
  }
}

// Função para obter uma ferramenta específica por ID
export async function getToolById(id: string): Promise<Tool | null> {
  try {
    const { data, error } = await supabaseClient
      .from("tools")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Ferramenta não encontrada
      }
      console.error(`Erro ao buscar ferramenta com ID ${id}:`, error.message);
      throw new Error("Não foi possível obter a ferramenta.");
    }

    return data;
  } catch (error) {
    console.error(`Erro inesperado ao buscar ferramenta com ID ${id}:`, error);
    throw error;
  }
}

// Função para criar uma ferramenta
interface ToolInsert {
  name: string;
  description?: string;
}

export async function createTool(data: ToolInsert): Promise<Tool> {
  try {
    const { data: tool, error } = await supabaseClient
      .from("tools")
      .insert([data]) // Passe o objeto dentro de um array
      .select()
      .single();

    if (error) {
      throw error;
    }

    return tool;
  } catch (error) {
    console.error("Erro ao criar ferramenta:", error);
    throw error;
  }
}

// Função para atualizar uma ferramenta
export async function updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
  try {
    const { data: tool, error } = await supabaseClient
      .from("tools")
      .update({
        name: data.name || '', // Provide a default value
        description: data.description || '', // Provide a default value
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar ferramenta com ID ${id}:`, error.message);
      throw new Error("Não foi possível atualizar a ferramenta.");
    }

    return tool;
  } catch (error) {
    console.error(`Erro inesperado ao atualizar ferramenta com ID ${id}:`, error);
    throw error;
  }
}

// Função para excluir uma ferramenta
export async function deleteTool(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from("tools")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Erro ao excluir ferramenta com ID ${id}:`, error.message);
      throw new Error("Não foi possível excluir a ferramenta.");
    }
  } catch (error) {
    console.error(`Erro inesperado ao excluir ferramenta com ID ${id}:`, error);
    throw error;
  }
}