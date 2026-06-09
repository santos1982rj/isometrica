'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
        .map((p, idx, arr) => {
          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
              <button
                onClick={() => onPageChange(p)}
                className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  p === currentPage
                    ? 'bg-isometrica-accent text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
