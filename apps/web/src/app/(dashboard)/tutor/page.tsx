'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, User, Send, Sparkles } from 'lucide-react';

interface Mensagem {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function TutorPage() {
  const { usuario } = useAuth();
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usuario) return;
    api.ai.conversas(usuario.id).then(async (conversas) => {
      if (conversas.length > 0) {
        const ultima = conversas[0];
        setConversaId(ultima.id);
        const dados = await api.ai.obterConversa(ultima.id);
        setMensagens(dados.messages ?? []);
      }
    }).catch(console.error).finally(() => setCarregando(false));
  }, [usuario]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function enviar() {
    if (!input.trim() || !usuario || enviando) return;

    const texto = input.trim();
    setInput('');
    setEnviando(true);

    const mensagemUsuario: Mensagem = {
      id: crypto.randomUUID(),
      role: 'user',
      content: texto,
      createdAt: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, mensagemUsuario]);

    try {
      let id = conversaId;
      if (!id) {
        const conv = await api.ai.criarConversa(usuario.id, 'Dúvida - ' + texto.slice(0, 40));
        id = conv.id;
        setConversaId(id);
      }

      await api.ai.enviarMensagem(id!, 'user', texto);

      const mensagemIa: Mensagem = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Olá! Sou o tutor IA da Isométrica. Entendi sua dúvida sobre "${texto.slice(0, 60)}". Estou analisando…\n\nEm breve, o tutor responderá com explicações detalhadas, exemplos e exercícios personalizados baseados no seu nível de conhecimento.`,
        createdAt: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, mensagemIa]);
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">Tutor IA</h1>
        <p className="text-muted-foreground">Tire dúvidas e receba recomendações personalizadas</p>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-isometrica-accent">
              <Bot className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">Tutor Isométrica</CardTitle>
              <CardDescription className="text-xs">IA de aprendizado</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
          {carregando ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`h-12 w-3/4 animate-pulse rounded-xl ${i % 2 === 0 ? 'bg-isometrica-primary/10' : 'bg-muted'}`} />
                </div>
              ))}
            </div>
          ) : mensagens.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="mb-4 size-12 text-isometrica-accent" />
              <h3 className="font-display text-lg font-semibold">Como posso ajudar?</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Pergunte sobre qualquer assunto de Engenharia. Posso explicar conceitos, resolver exercícios e sugerir materiais de estudo.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'O que é momento fletor?',
                  'Explique a Lei de Hooke',
                  'Como calcular reações de apoio?',
                ].map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => { setInput(sugestao); }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            mensagens.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-isometrica-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={fimRef} />
        </CardContent>

        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); enviar(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida…"
              disabled={enviando || carregando}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={enviando || !input.trim() || carregando}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
