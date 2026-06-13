'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-extrabold text-white">I</div>
              <div className="leading-tight">
                <span className="font-display text-base font-bold">Isométrica</span>
                <span className="block text-[7px] font-medium uppercase tracking-[0.3px] text-muted-foreground">Plataforma de evolução</span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma inteligente de evolução acadêmica para estudantes de Engenharia. IA, dados e gamificação trabalhando juntos.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Produto</h4>
            <div className="flex flex-col gap-2">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recursos</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Planos</Link>
              <Link href="/cadastro" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cadastro</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Empresa</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Contato</span>
              <span className="text-sm text-muted-foreground">Sobre</span>
              <span className="text-sm text-muted-foreground">Termos</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Isométrica. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
