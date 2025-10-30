import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Controle de Ponto - Banco de Horas',
  description: 'Sistema simples e eficaz para controle de ponto e banco de horas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
