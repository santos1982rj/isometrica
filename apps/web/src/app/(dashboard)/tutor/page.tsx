'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function TutorContent() {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState(searchParams.get('pergunta') ?? '');
  const [enviando, setEnviando] = useState(false);
  const [streamContent, setStreamContent] = useState('');
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

      // Inicia streaming
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
      const msgId = crypto.randomUUID();

      const msgPlaceholder: Mensagem = {
        id: msgId, role: 'assistant', content: '', createdAt: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, msgPlaceholder]);
      setStreamContent('');

      const response = await fetch(`${API_URL}/ai/conversations/${id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: 'user', content: texto }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.done) break;
              if (parsed.token) {
                fullContent += parsed.token;
                setStreamContent(fullContent);
              }
            } catch {}
          }
        }
      }

      // After stream ends, reload conversation
      const dados = await api.ai.obterConversa(id!);
      const msgs = (dados.messages ?? []) as Mensagem[];
      setMensagens(msgs);
      setStreamContent('');
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
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-3.5rem)] flex-col">
      <div className="mb-3 px-1">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Tutor IA</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Tire dúvidas e receba recomendações personalizadas</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b border-border px-4 py-3 shrink-0">
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

        <CardContent className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
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
            <>
              {mensagens.map((msg, idx) => {
                const isLastAssistant = idx === mensagens.length - 1 && msg.role === 'assistant'
                const displayContent = isLastAssistant && streamContent ? streamContent : msg.content
                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-isometrica-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{displayContent}</p>
                      <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {isLastAssistant && streamContent ? 'digitando...' : new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          <div ref={fimRef} />
        </CardContent>

        <div className="border-t border-border p-3 sm:p-4 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); enviar(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida…"
              disabled={enviando || carregando}
              className="flex-1 text-sm"
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

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-8rem)] items-center justify-center"><p className="text-sm text-muted-foreground">Carregando...</p></div>}>
      <TutorContent />
    </Suspense>
  );
}
