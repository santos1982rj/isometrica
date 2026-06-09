import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 text-2xl font-extrabold text-white shadow-md">
        I
      </div>
      <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Página não encontrada</p>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
