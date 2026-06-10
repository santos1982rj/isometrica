import { FileDown, Download } from 'lucide-react'

interface Material {
  name: string
  url: string
  type: string
}

interface MaterialsCardProps {
  materials: Material[]
}

export function MaterialsCard({ materials }: MaterialsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <FileDown className="size-3.5" /> Materiais da aula
      </h4>
      {materials.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhum material disponível</p>
      ) : (
        <div className="space-y-2">
          {materials.map((mat, i) => (
            <a
              key={i}
              href={mat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-isometrica-accent/10">
                <Download className="size-3.5 text-isometrica-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-tight truncate">{mat.name ?? 'Material'}</p>
                {mat.url && <p className="text-[10px] text-muted-foreground truncate">{mat.url.split('/').pop()}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
