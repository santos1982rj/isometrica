import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou foi removida.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-isometrica-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-isometrica-accent/90"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
