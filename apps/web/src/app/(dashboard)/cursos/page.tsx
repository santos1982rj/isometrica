'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Curso {
  id: string;
  name: string;
  description: string;
  subject: { name: string };
  modules: any[];
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.courses.listar().then(setCursos).catch(console.error).finally(() => setCarregando(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meus Cursos</h1>
        <p className="text-muted-foreground">Todos os cursos disponíveis na plataforma</p>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-4 w-3/4 rounded bg-muted" /></CardHeader>
              <CardContent><div className="h-3 w-full rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <Link key={curso.id} href={`/cursos/${curso.id}`}>
              <Card className="cursor-pointer transition-all hover:border-isometrica-accent hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{curso.name}</CardTitle>
                    <Badge variant="secondary">{curso.subject.name}</Badge>
                  </div>
                  <CardDescription className="text-xs">{curso.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {curso.modules?.length ?? 0} módulos
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
