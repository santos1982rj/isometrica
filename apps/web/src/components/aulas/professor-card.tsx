interface ProfessorCardProps {
  professor: {
    name?: string | null
    title?: string | null
    lattes?: string | null
    linkedin?: string | null
  } | null
  subjectName?: string | null
}

export function ProfessorCard({ professor, subjectName }: ProfessorCardProps) {
  if (!professor) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professor</h4>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-bold text-white shadow-sm">
          {professor.name?.[0] ?? 'P'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{professor.name ?? 'Professor'}</p>
          {professor.title && <p className="text-xs text-muted-foreground">{professor.title}</p>}
          <p className="text-[10px] text-muted-foreground/70">{subjectName ?? 'Engenharia'}</p>
          {(professor.lattes || professor.linkedin) && (
            <div className="mt-1 flex items-center gap-2">
              {professor.lattes && (
                <a href={professor.lattes} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">
                  Lattes
                </a>
              )}
              {professor.linkedin && (
                <a href={professor.linkedin} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
