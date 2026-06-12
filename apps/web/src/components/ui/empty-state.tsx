import { type LucideIcon, FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-3 size-10 text-muted-foreground/30" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-isometrica-accent/90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
