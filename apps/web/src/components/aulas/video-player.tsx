'use client'

import { Play } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl?: string | null
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (videoUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-black shadow-lg" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={videoUrl}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-gradient-to-br from-isometrica-primary/[0.03] to-isometrica-accent/[0.03] border border-border">
      <Play className="mb-3 size-14 sm:size-16 text-muted-foreground/15" />
      <p className="text-sm text-muted-foreground">Vídeo em produção</p>
    </div>
  )
}
