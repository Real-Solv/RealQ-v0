"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { useToast } from "@/hooks/use-toast"
import { signIn, signInWithProvider, checkSession } from "@/lib/supabase/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectedFrom") || "/dashboard"
  const errorParam = searchParams.get("error")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // ✅ Verifica se já existe sessão ativa — sem redirecionar automaticamente indevido
  useEffect(() => {
    const checkUserSession = async () => {
      console.log("[Login Page] Checking if user is already logged in")
      try {
        const isLoggedIn = await checkSession()
        console.log("[Login Page] User session check result:", { isLoggedIn })

        // ✅ Só redireciona se a sessão estiver ativa e não houver forçamento de login
        if (isLoggedIn && !window.location.search.includes("forceLogin=true")) {
          console.log("[Login Page] User is already logged in, redirecting to dashboard")
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("[Login Page] Error checking session:", error)
        setDebugInfo(
          `Session check error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      }
    }

    checkUserSession()
  }, [router])

  // Detecta erro via parâmetro da URL
  useEffect(() => {
    if (errorParam) {
      console.error("[Login Page] Error parameter in URL:", errorParam)

      if (errorParam === "server_error") {
        setError("Ocorreu um erro no servidor. Por favor, tente novamente.")
        setDebugInfo("Server error detected in URL parameter")
        toast({
          title: "Erro no servidor",
          description: "Ocorreu um erro ao acessar o dashboard. Por favor, tente novamente.",
          variant: "destructive",
        })
      } else if (errorParam === "auth_error") {
        setError("Erro de autenticação. Por favor, tente novamente.")
        setDebugInfo("Auth error detected in URL parameter")
        toast({
          title: "Erro de autenticação",
          description: "Ocorreu um erro durante a autenticação. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    }
  }, [errorParam, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setDebugInfo(null)

    console.log("[Login Page] Attempting to log in user", { email: formData.email })

    try {
      const startTime = Date.now()
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      })
      const endTime = Date.now()

      console.log("[Login Page] Login successful", {
        userId: result.user?.id,
        timeMs: endTime - startTime,
      })

      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o dashboard.",
      })

      // Aguarda um tempo para cookies e sessão serem aplicados corretamente
      setTimeout(() => {
        console.log("[Login Page] Redirecting to:", redirectTo)
        window.location.href = `${redirectTo}?auth=${Date.now()}`
      }, 1500)
    } catch (error) {
      console.error("[Login Page] Login error:", error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao fazer login. Verifique suas credenciais e tente novamente."

      setError(errorMessage)
      setDebugInfo(`Login error: ${JSON.stringify(error)}`)

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProviderSignIn = async (provider: "google" | "github") => {
    console.log("[Login Page] Attempting to log in with provider", { provider })

    try {
      await signInWithProvider(provider)
    } catch (error) {
      console.error(`[Login Page] Error logging in with ${provider}:`, error)

      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado."

      setDebugInfo(`Provider login error: ${JSON.stringify(error)}`)

      toast({
        title: `Erro ao fazer login com ${provider}`,
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <div className="container px-4 py-12 md:py-24">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Entrar no RealQ</h1>
              <p className="text-muted-foreground">Faça login para acessar sua conta</p>
            </div>
            <div className="space-y-4 rounded-lg border p-6 bg-background/80 backdrop-blur">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {debugInfo && process.env.NODE_ENV !== "production" && (
                <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900">
                  <AlertTitle className="text-yellow-800 dark:text-yellow-300">Debug Info</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs">
                    {debugInfo}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link href="/recuperar-senha" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                    }
                    disabled={isSubmitting}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Lembrar de mim
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleProviderSignIn("google")}
                  disabled={isSubmitting}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleProviderSignIn("github")}
                  disabled={isSubmitting}
                >
                  GitHub
                </Button>
              </div>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </div>
            </div>
            <Button variant="link" asChild className="mx-auto">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a página inicial
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
