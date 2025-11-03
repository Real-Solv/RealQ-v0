"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RealQ - Sistema de Controle de Qualidade",
  description:
    "Ferramenta de qualidade para cadastro e controle de produtos alimentícios",
  generator: "v0.app",
  openGraph: {
    title: "RealQ - Sistema de Controle de Qualidade",
    description:
      "Ferramenta de qualidade para cadastro e controle de produtos alimentícios",
    url: "https://real-q-continue-7t.vercel.app/",
    siteName: "RealQ",
    images: [
      {
        url: "https://real-q-continue-7t.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "RealQ - Controle de Qualidade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as any, // ✅ Next.js ainda não tipa "card"
    title: "RealQ - Sistema de Controle de Qualidade",
    description:
      "Ferramenta de qualidade para cadastro e controle de produtos alimentícios",
    images: ["https://real-q-continue-7t.vercel.app/preview.png"],
  },
}

function safeString(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "default" in value) {
    const defaultValue = (value as { default?: string }).default
    return typeof defaultValue === "string" ? defaultValue : undefined
  }
  return undefined
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const twitterImages = Array.isArray(metadata.twitter?.images)
    ? metadata.twitter?.images
    : [metadata.twitter?.images]

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta property="og:title" content={safeString(metadata.openGraph?.title)} />
        <meta
          property="og:description"
          content={safeString(metadata.openGraph?.description)}
        />
        <meta property="og:url" content={safeString(metadata.openGraph?.url)} />
        <meta
          property="og:site_name"
          content={safeString(metadata.openGraph?.siteName)}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          
        />
        <meta
          property="og:image:width"
          
        />
        <meta
          property="og:image:height"
          
        />
        <meta
          property="og:image:alt"
          
        />

        
        <meta name="twitter:title" content={safeString(metadata.twitter?.title)} />
        <meta
          name="twitter:description"
          content={safeString(metadata.twitter?.description)}
        />
        {twitterImages?.[0] && (
          <meta name="twitter:image" content={safeString(twitterImages[0])} />
        )}

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-E3CTSPCFSE"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-E3CTSPCFSE');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
