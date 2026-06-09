import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou foi removida.
      </p>
      <Button asChild>
        <Link href="/dashboard">Voltar ao início</Link>
      </Button>
    </div>
  )
}
