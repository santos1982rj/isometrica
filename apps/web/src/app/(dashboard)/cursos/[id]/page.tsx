'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, FileText } from 'lucide-react';

interface Modulo {
  id: string;
  name: string;
  order: number;
  lessons: Aula[];
}

interface Aula {
  id: string;
  title: string;
  type: string;
  order: number;
}

export default function CursoDetalhePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [curso, setCurso] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.courses.detalhe(id).then(setCurso).catch(console.error).finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse"><CardContent className="h-20" /></Card>
        ))}
      </div>
    );
  }

  if (!curso) return <p>Curso não encontrado</p>;

  const totalAulas = curso.modules.reduce((a: number, m: Modulo) => a + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/cursos" className="hover:text-foreground">Cursos</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{curso.name}</span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold">{curso.name}</h1>
        <div className="mt-1 flex items-center gap-3">
          <Badge variant="secondary">{curso.subject.name}</Badge>
          <span className="text-sm text-muted-foreground">{curso.modules.length} módulos · {totalAulas} aulas</span>
        </div>
        <p className="mt-2 text-muted-foreground">{curso.description}</p>
      </div>

      <div className="space-y-4">
        {(curso.modules as Modulo[]).map((modulo) => (
          <Card key={modulo.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Módulo {modulo.order}: {modulo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {modulo.lessons.map((aula) => (
                  <Link
                    key={aula.id}
                    href={`/aulas/${aula.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {aula.type === 'video' ? (
                      <Play className="size-4 text-isometrica-accent" />
                    ) : (
                      <FileText className="size-4 text-isometrica-primary" />
                    )}
                    <span className="flex-1">{aula.order}. {aula.title}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
