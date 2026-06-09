'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await api.auth.esqueceuSenha(email);
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao solicitar recuperação');
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-isometrica-primary/5 to-isometrica-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Email Enviado</CardTitle>
            <CardDescription>
              Se o email existir, você receberá um link de recuperação em breve.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/entrar" className="text-sm text-isometrica-accent hover:underline">
              Voltar ao login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-isometrica-primary/5 to-isometrica-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-isometrica-primary text-xl font-bold text-white">
            I
          </div>
          <CardTitle className="font-display text-2xl">Esqueceu a Senha?</CardTitle>
          <CardDescription>
            Digite seu email e enviaremos um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {erro}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-isometrica-primary hover:bg-isometrica-primary/90" disabled={carregando}>
              {carregando ? 'Enviando…' : 'Enviar Link'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Lembrou a senha?{' '}
            <Link href="/entrar" className="font-medium text-isometrica-accent hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
