'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTutorChat } from '@/hooks/use-tutor-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Send, Sparkles } from 'lucide-react';

function TutorContent() {
  const searchParams = useSearchParams();
  const {
    mensagens,
    input,
    setInput,
    enviar,
    enviando,
    streamContent,
    carregando,
    fimRef,
  } = useTutorChat({ initialValue: searchParams.get('pergunta') ?? '' });

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
