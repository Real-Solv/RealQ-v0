import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

// ⚙️ Configuração temporária para permitir acesso sem autenticação
const BYPASS_AUTH = true // Defina como false para reativar a autenticação

export async function middleware(req: NextRequest) {
  // Cria o objeto de resposta
  const res = NextResponse.next()

  // Ignora assets estáticos e rotas de API
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/static")
  ) {
    return res
  }

  console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`)

  // 🟢 Se o bypass estiver ativado, libera tudo
  if (BYPASS_AUTH) {
    console.log(`[Middleware] Auth bypass enabled, allowing access to: ${req.nextUrl.pathname}`)
    return res
  }

  try {
    // 🔹 Cria o cliente Supabase para middleware
    const supabase = createMiddlewareClient<Database>({ req, res })

    // 🔎 Obtém a sessão atual
    console.log(`[Middleware] Checking session for: ${req.nextUrl.pathname}`)
    const sessionStart = Date.now()
    const { data: sessionData, error } = await supabase.auth.getSession()
    const sessionEnd = Date.now()
    const session = sessionData?.session

    console.log(`[Middleware] Session check took ${sessionEnd - sessionStart}ms`)

    if (error) {
      console.error(`[Middleware] Error getting session:`, error)
    }

    // 🧩 Log detalhado de sessão
    if (session) {
      const expiresAt = session.expires_at ?? 0 // previne erro de undefined
      const createdAt = session.user?.created_at ?? "unknown"

      console.log(`[Middleware] Session found:`, {
        userId: session.user?.id,
        email: session.user?.email,
        created: createdAt,
        expires: new Date(expiresAt * 1000).toISOString(),
        remaining:
          expiresAt > 0
            ? Math.floor((expiresAt * 1000 - Date.now()) / 1000) + "s"
            : "unknown",
      })
    } else {
      console.log(`[Middleware] No session found`)
    }

    // 🔒 Define rotas protegidas e rotas de autenticação
    const isAuthRoute = ["/login", "/cadastro", "/recuperar-senha"].includes(req.nextUrl.pathname)
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

    console.log(
      `[Middleware] Route type: ${
        isAuthRoute ? "Auth route" : isProtectedRoute ? "Protected route" : "Public route"
      }`
    )

    // 🚫 Usuário não autenticado acessando rota protegida
    if (!session && isProtectedRoute) {
      console.log(`[Middleware] Redirecting unauthenticated user from ${req.nextUrl.pathname} to /login`)
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 🔁 Usuário autenticado acessando rota de login/cadastro
    if (session && isAuthRoute) {
      console.log(`[Middleware] Redirecting authenticated user from ${req.nextUrl.pathname} to /dashboard`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    console.log(`[Middleware] Request allowed to proceed to: ${req.nextUrl.pathname}`)
    return res
  } catch (error) {
    console.error("[Middleware] Error in middleware:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
