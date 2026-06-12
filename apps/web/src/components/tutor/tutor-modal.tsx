'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useConversations, useConversation, useCreateConversation, useSendMessage } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import type { Mensagem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bot, User, Send, Sparkles, X } from 'lucide-react';

interface TutorModalProps {
  open: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export function TutorModal({ open, onClose, initialQuestion }: TutorModalProps) {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [enviando, setEnviando] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [carregando, setCarregando] = useState(true);
  const fimRef = useRef<HTMLDivElement>(null);

  const { data: conversasList } = useConversations(usuario?.id ?? '');
  const { data: conversaData } = useConversation(conversaId ?? '');
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (open && initialQuestion) {
      setInput(initialQuestion);
    }
  }, [open, initialQuestion]);

  useEffect(() => {
    if (conversasList && conversasList.length > 0 && !conversaId) {
      setConversaId(conversasList[0].id);
    }
  }, [conversasList, conversaId]);

  useEffect(() => {
    if (conversaData?.messages && !enviando) {
      setMensagens(conversaData.messages as Mensagem[]);
    }
  }, [conversaData, enviando]);

  useEffect(() => {
    if (conversasList) {
      if (conversasList.length === 0) {
        setCarregando(false);
      } else if (conversaId && conversaData) {
        setCarregando(false);
      }
    }
  }, [conversasList, conversaId, conversaData]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, streamContent]);

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
        const conv = await createConversation.mutateAsync({ userId: usuario.id, title: 'Dúvida - ' + texto.slice(0, 40) });
        id = conv.id;
        setConversaId(id);
      }

      await sendMessage.mutateAsync({ conversationId: id!, role: 'user', content: texto });

      const msgId = crypto.randomUUID();
      const msgPlaceholder: Mensagem = {
        id: msgId, role: 'assistant', content: '', createdAt: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, msgPlaceholder]);
      setStreamContent('');

      const response = await fetch(`/api/ai/conversations/${id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: texto }),
        credentials: 'include',
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

      const dados = await api.ai.obterConversa(id!);
      const msgs = (dados.messages ?? []) as Mensagem[];
      setMensagens(msgs);
      setStreamContent('');
    } catch {
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="flex h-[80vh] max-h-[700px] w-[95vw] max-w-[600px] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-isometrica-accent">
                <Bot className="size-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-sm">Tutor Isométrica</DialogTitle>
                <DialogDescription className="text-xs">IA de aprendizado</DialogDescription>
              </div>
            </div>
            <button onClick={onClose} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
              <Sparkles className="mb-4 size-10 text-isometrica-accent" />
              <h3 className="font-display text-base font-semibold">Como posso ajudar?</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Pergunte sobre qualquer assunto de Engenharia. Posso explicar conceitos, resolver exercícios e sugerir materiais de estudo.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  'O que é momento fletor?',
                  'Explique a Lei de Hooke',
                  'Como calcular reações de apoio?',
                ].map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => setInput(sugestao)}
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
                const isLastAssistant = idx === mensagens.length - 1 && msg.role === 'assistant';
                const displayContent = isLastAssistant && streamContent ? streamContent : msg.content;
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
                );
              })}
            </>
          )}
          <div ref={fimRef} />
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="flex gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
