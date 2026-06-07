'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, FileText } from 'lucide-react';

export default function AulaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [aula, setAula] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.courses.listar().then(async (cursos) => {
      for (const curso of cursos) {
        for (const mod of curso.modules ?? []) {
          for (const les of mod.lessons ?? []) {
            if (les.id === id) {
              setAula({ ...les, cursoNome: curso.name, moduloNome: mod.name });
              return;
            }
          }
        }
      }
    }).catch(console.error).finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="aspect-video animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!aula) return <p>Aula não encontrada</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/cursos/${id.split('-')[0]}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Voltar ao curso
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{aula.title}</h1>
        <p className="text-sm text-muted-foreground">
          {aula.cursoNome} · {aula.moduloNome}
        </p>
      </div>

      <div className="aspect-video flex items-center justify-center rounded-lg bg-muted">
        {aula.type === 'video' ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Play className="size-12" />
            <p>Player de vídeo em breve</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="size-12" />
            <p>Conteúdo em texto em breve</p>
          </div>
        )}
      </div>

      {aula.content && (
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: aula.content }} />
        </Card>
      )}
    </div>
  );
}
