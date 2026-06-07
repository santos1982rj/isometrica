'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecuperarSenhaPage(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = use(props.searchParams);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem');
      return;
    }

    if (!token) {
      setErro('Token de recuperação inválido');
      return;
    }

    setCarregando(true);
    try {
      await api.auth.recuperarSenha(token, novaSenha);
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-isometrica-primary/5 to-isometrica-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/entrar"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-isometrica-primary px-6 text-sm font-medium text-white hover:bg-isometrica-primary/90"
            >
              Fazer Login
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
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-isometrica-accent text-xl font-bold text-white">
            I
          </div>
          <CardTitle className="font-display text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para sua conta
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
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input
                id="novaSenha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmacao">Confirmar Senha</Label>
              <Input
                id="confirmacao"
                type="password"
                placeholder="Repita a senha"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-isometrica-accent hover:bg-isometrica-accent/90" disabled={carregando}>
              {carregando ? 'Redefinindo…' : 'Redefinir Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
