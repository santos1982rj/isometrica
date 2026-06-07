'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { usuario } = useAuth();

  if (!usuario) return null;

  const stats = [
    { titulo: 'Cursos Ativos', valor: '3', cor: 'border-l-isometrica-accent' },
    { titulo: 'Aulas Completas', valor: '12', cor: 'border-l-isometrica-primary' },
    { titulo: 'Questões Respondidas', valor: '47', cor: 'border-l-green-500' },
    { titulo: 'Proficiência Média', valor: '68%', cor: 'border-l-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Bem-vindo, {usuario.name ?? 'Estudante'}!
        </h1>
        <p className="text-muted-foreground">Acompanhe sua evolução acadêmica</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.titulo} className={`border-l-4 ${stat.cor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stat.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade nos últimos 7 dias.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tópicos com Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete mais aulas para gerar recomendações.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
