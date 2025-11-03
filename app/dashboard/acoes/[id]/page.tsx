"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [action, setAction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAction = async () => {
      if (!params.id) {
        setError("ID inválido.");
        return;
      }

      const { data, error } = await supabaseClient
        .from("acoes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAction(data);
      }

      setIsLoading(false);
    };

    fetchAction();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Erro: {error} <br />
        <button onClick={() => router.back()}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Detalhes da Ação</h1>
      <p><strong>ID:</strong> {action.id}</p>
      <p><strong>Nome:</strong> {action.name}</p>
      <p><strong>Descrição:</strong> {action.description}</p>
      <p><strong>Criado em:</strong> {new Date(action.created_at).toLocaleString()}</p>
      {/* Adicione outros campos conforme necessário */}
    </div>
  );
}