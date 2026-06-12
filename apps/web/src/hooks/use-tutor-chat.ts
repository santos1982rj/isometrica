'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Mensagem } from '@/lib/types';

export interface UseTutorChatReturn {
  mensagens: Mensagem[];
  input: string;
  setInput: (val: string) => void;
  enviar: () => Promise<void>;
  enviando: boolean;
  streamContent: string;
  carregando: boolean;
  fimRef: React.RefObject<HTMLDivElement | null>;
}

export function useTutorChat({ initialValue = '' }: { initialValue?: string } = {}): UseTutorChatReturn {
  const { usuario } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState(initialValue);
  const [enviando, setEnviando] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, streamContent]);

  const enviar = useCallback(async () => {
    if (!input.trim() || !usuario || enviando) return;

    const texto = input.trim();
    setInput('');
    setEnviando(true);

    const userMsg: Mensagem = {
      id: crypto.randomUUID(), role: 'user', content: texto,
      createdAt: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, userMsg]);

    try {
      let id = convId;
      if (!id) {
        const conv = await fetch('/api/ai/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: usuario.id, title: 'Dúvida - ' + texto.slice(0, 40) }),
          credentials: 'include',
        }).then((r) => r.json());
        id = conv.id;
        setConvId(id);
      }

      await fetch(`/api/ai/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: texto }),
        credentials: 'include',
      });

      const placeholderId = crypto.randomUUID();
      setMensagens((prev) => [...prev, { id: placeholderId, role: 'assistant', content: '', createdAt: new Date().toISOString() }]);
      setStreamContent('');

      const resp = await fetch(`/api/ai/conversations/${id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: texto }),
        credentials: 'include',
      });

      const reader = resp.body?.getReader();
      if (!reader) { throw new Error('No reader'); }

      const decoder = new TextDecoder();
      let buf = '';
      let full = '';
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const p = JSON.parse(line.slice(6));
              if (p.done) { done = true; break; }
              if (p.token) {
                full += p.token;
                setStreamContent(full);
              }
            } catch { /* skip malformed SSE */ }
          }
        }
      }

      setMensagens((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, content: full } : m))
      );
      setStreamContent('');
    } catch {
      setMensagens((prev) => [...prev, {
        id: crypto.randomUUID(), role: 'assistant',
        content: 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setEnviando(false);
    }
  }, [input, usuario, enviando, convId]);

  return { mensagens, input, setInput, enviar, enviando, streamContent, carregando, fimRef };
}
