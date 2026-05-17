import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';
import katex from 'katex';

function renderizarLatex(texto: string): string {
  // Divide o texto em partes: fora de $$ e dentro de $$
  const partes = texto.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g);
  
  return partes.map((parte) => {
    // Verifica se é uma fórmula (começa e termina com $)
    if (parte.startsWith('$$') && parte.endsWith('$$')) {
      // Fórmula em bloco
      const formula = parte.slice(2, -2).trim();
      try {
        return katex.renderToString(formula, { 
          throwOnError: false,
          displayMode: true 
        });
      } catch {
        return parte;
      }
    } else if (parte.startsWith('$') && parte.endsWith('$')) {
      // Fórmula inline
      const formula = parte.slice(1, -1).trim();
      try {
        return katex.renderToString(formula, { 
          throwOnError: false,
          displayMode: false 
        });
      } catch {
        return parte;
      }
    }
    // Texto normal (não é fórmula)
    return parte;
  }).join('');
}


interface Mensagem {
  id: number;
  tipo: 'usuario' | 'ia';
  texto: string;
  timestamp: Date;
}

interface TutorChatProps {
  contextoAula?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const MENSAGEM_BOAS_VINDAS =
  'Olá! Sou o G.A.M.A., seu tutor de engenharia. Pergunte o que quiser sobre esta aula ou sobre a NBR 6118:2023.';

const TutorChat: React.FC<TutorChatProps> = ({ contextoAula }) => {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 0,
      tipo: 'ia',
      texto: MENSAGEM_BOAS_VINDAS,
      timestamp: new Date(),
    },
  ]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const fimDasMensagensRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fimDasMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  useEffect(() => {
    if (aberto) {
      inputRef.current?.focus();
    }
  }, [aberto]);

  async function handleEnviar(): Promise<void> {
    const pergunta = novaMensagem.trim();
    if (!pergunta || enviando) return;

    const mensagemUsuario: Mensagem = {
      id: Date.now(),
      tipo: 'usuario',
      texto: pergunta,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, mensagemUsuario]);
    setNovaMensagem('');
    setEnviando(true);

    try {
      const resposta = await fetch(`${API_URL}/ia/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, contextoAula }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao consultar o tutor.');
      }

      const mensagemIA: Mensagem = {
        id: Date.now() + 1,
        tipo: 'ia',
        texto: dados.resposta,
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, mensagemIA]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro de conexão');

      const mensagemErro: Mensagem = {
        id: Date.now() + 1,
        tipo: 'ia',
        texto:
          'Desculpe, ocorreu um erro. Verifique sua conexão ou tente novamente.',
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, mensagemErro]);
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 text-white rounded-full shadow-xl hover:bg-primary-600 transition-all hover:scale-110 flex items-center justify-center"
        title="Tutor de IA"
      >
        {aberto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-500 text-white">
              <Bot size={20} />
              <div>
                <p className="font-semibold text-sm">
                  G.A.M.A. - Tutor Virtual
                </p>
                <p className="text-xs opacity-80">
                  Especialista em NBR 6118:2023
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      msg.tipo === 'usuario'
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.tipo === 'ia' ? (
                        <Bot size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.tipo === 'ia' ? 'G.A.M.A.' : 'Você'}
                      </span>
                    </div>
                    {msg.tipo === 'ia' ? (
  <div
    className="whitespace-pre-wrap text-sm"
    dangerouslySetInnerHTML={{ __html: renderizarLatex(msg.texto) }}
  />
) : (
  <p className="whitespace-pre-wrap">{msg.texto}</p>
)}
                  </div>
                </div>
              ))}
              <div ref={fimDasMensagensRef} />
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte algo sobre a aula..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                disabled={enviando}
              />
              <button
                onClick={handleEnviar}
                disabled={!novaMensagem.trim() || enviando}
                className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {enviando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorChat;