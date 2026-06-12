'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useConversations, useConversation, useCreateConversation, useSendMessage } from '@/lib/queries';
import type { Mensagem } from '@/lib/types';

export interface UseTutorChatReturn {
  conversaId: string | null;
  mensagens: Mensagem[];
  input: string;
  setInput: (val: string) => void;
  enviar: () => Promise<void>;
  enviando: boolean;
  streamContent: string;
  carregando: boolean;
  fimRef: React.RefObject<HTMLDivElement | null>;
}

interface UseTutorChatOptions {
  initialValue?: string;
}

export function useTutorChat({ initialValue = '' }: UseTutorChatOptions = {}): UseTutorChatReturn {
  const { usuario } = useAuth();
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState(initialValue);
  const [enviando, setEnviando] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [carregando, setCarregando] = useState(true);
  const fimRef = useRef<HTMLDivElement>(null);

  const { data: conversasList } = useConversations(usuario?.id ?? '');
  const { data: conversaData } = useConversation(conversaId ?? '');
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

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

  return {
    conversaId,
    mensagens,
    input,
    setInput,
    enviar,
    enviando,
    streamContent,
    carregando,
    fimRef,
  };
}
