'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function BarraProficiencia({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  const pct = Math.round(valor * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({ valor, rotulo }: { valor: number; rotulo: string }) {
  const raio = 40;
  const circ = 2 * Math.PI * raio;
  const offset = circ - (valor / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={raio}
          fill="none"
          stroke="hsl(var(--color-isometrica-accent))"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-500"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-lg font-bold">
          {Math.round(valor)}%
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">{rotulo}</span>
    </div>
  );
}

export default function ProgressoPage() {
  const { usuario } = useAuth();
  const [modelo, setModelo] = useState<any[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    Promise.all([
      api.learning.modelo(usuario.id),
      api.learning.diagnosticos(usuario.id),
    ]).then(([m, d]) => {
      setModelo(m);
      setDiagnosticos(d);
    }).catch(console.error).finally(() => setCarregando(false));
  }, [usuario]);

  if (!usuario) return null;

  const profMedia = modelo.length > 0
    ? modelo.reduce((a, m) => a + m.proficiency, 0) / modelo.length * 100
    : 0;

  const topicosCriticos = modelo.filter((m) => m.proficiency < 0.4);
  const topicosBons = modelo.filter((m) => m.proficiency >= 0.7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meu Progresso</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução nos tópicos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <DonutChart valor={profMedia} rotulo="Proficiência Média" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl font-bold text-isometrica-accent">{topicosCriticos.length}</p>
            <p className="text-xs text-muted-foreground">Tópicos com dificuldade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl font-bold text-green-600">{topicosBons.length}</p>
            <p className="text-xs text-muted-foreground">Tópicos dominados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proficiência por Tópico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {carregando ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}</div>
          ) : modelo.length === 0 ? (
            <p className="text-sm text-muted-foreground">Responda questões para gerar seu mapa de proficiência.</p>
          ) : (
            modelo.map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{m.topic?.name ?? 'Tópico'}</p>
                    <p className="text-xs text-muted-foreground">{m.topic?.subject?.name}</p>
                  </div>
                  {m.proficiency < 0.4 && <Badge variant="destructive">Dificuldade</Badge>}
                  {m.proficiency >= 0.7 && <Badge className="bg-green-500">Dominado</Badge>}
                </div>
                <BarraProficiencia
                  label=""
                  valor={m.proficiency}
                  cor={m.proficiency < 0.4 ? 'bg-destructive' : m.proficiency >= 0.7 ? 'bg-green-500' : 'bg-isometrica-primary'}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {diagnosticos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Diagnósticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {diagnosticos.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <Badge variant="outline">{Object.keys(d.snapshot as object).length} tópicos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
