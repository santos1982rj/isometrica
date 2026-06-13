'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function NaoAutorizadoPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldAlert className="size-8 text-destructive" />
      </div>
      <h1 className="font-display text-2xl font-bold">Acesso Negado</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Você não tem permissão para acessar esta página. Se você acha que isso é um erro, entre em contato com o administrador.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
