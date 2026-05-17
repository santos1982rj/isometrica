/**
 * @file ContatoPage.tsx
 * @description Página de contato com formulário, WhatsApp e redes sociais.
 * 
 * @route /contato
 */

import React, { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { Badge } from '../components/ui/atoms/Badge';
import {
  Mail,
  Phone,
  Send,
  MessageCircle,
  Clock,
  ArrowRight,
  User,
  Users,
} from 'lucide-react';

const ContatoPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch('http://localhost:3001/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          assunto: assunto.trim() || 'Contato pelo site',
          mensagem: mensagem.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) throw new Error(dados.erro);

      toast.success('Mensagem enviada com sucesso!');
      setNome('');
      setEmail('');
      setAssunto('');
      setMensagem('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  function abrirWhatsApp(): void {
    const numero = '5521999999999'; // Substitua pelo seu número
    const texto = 'Olá! Vim pelo site da Isométrica.';
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  interface IconProps {
  size?: number;
  className?: string;
}

function IconInstagram({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

function IconYoutube({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function IconLinkedin({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* ─── Cabeçalho ──────────────────────────────────────── */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Fale Conosco
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Tem alguma dúvida, sugestão ou quer fazer uma parceria? 
          Escolha o canal de sua preferência.
        </p>
      </div>

      {/* ─── Grid Principal ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Informações de Contato */}
        <div className="space-y-6">
          <GlassPanel className="p-6!" glow>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Phone size={22} className="text-primary-500" />
              Canais de Atendimento
            </h2>

            {/* WhatsApp */}
            <button
              onClick={abrirWhatsApp}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 
                         border border-green-200 dark:border-green-800 hover:bg-green-100 
                         dark:hover:bg-green-900/40 transition-colors mb-4 group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-green-700 dark:text-green-400">WhatsApp</p>
                <p className="text-sm text-green-600 dark:text-green-500">Resposta em até 2 horas</p>
              </div>
              <ArrowRight size={18} className="text-green-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shrink-0">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">contato@structify.com.br</p>
              </div>
            </div>

            {/* Telefone */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shrink-0">
                <Phone size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Telefone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">(21) 99999-9999</p>
              </div>
            </div>
          </GlassPanel>

          {/* Redes Sociais */}
          <GlassPanel className="p-6!" glow>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users size={22} className="text-primary-500" />
              Redes Sociais
            </h2>

            <div className="space-y-3">
              {[
                { icon: IconInstagram, label: 'Instagram', href: '#', cor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500' },
                { icon: IconLinkedin, label: 'LinkedIn', href: '#', cor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500' },
                { icon: IconYoutube, label: 'YouTube', href: '#', cor: 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl text-gray-600 dark:text-gray-400 
                               transition-colors ${social.cor} group`}
                  >
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{social.label}</span>
                    <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </GlassPanel>

          {/* Horário */}
          <GlassPanel className="p-6!" glow>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={22} className="text-primary-500" />
              Horário de Atendimento
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex justify-between">
                <span>Segunda a Sexta</span>
                <span className="font-medium text-gray-900 dark:text-white">08h - 18h</span>
              </p>
              <p className="flex justify-between">
                <span>Sábado</span>
                <span className="font-medium text-gray-900 dark:text-white">09h - 13h</span>
              </p>
              <p className="flex justify-between">
                <span>Domingo</span>
                <Badge variant="warning" size="sm">Fechado</Badge>
              </p>
            </div>
          </GlassPanel>
        </div>

        {/* Coluna 2-3: Formulário */}
        <div className="lg:col-span-2">
          <GlassPanel className="p-8!" glow>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Envie uma Mensagem
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Preencha o formulário abaixo e retornaremos o mais breve possível.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Nome *"
                  icon={User}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
                <Input
                  label="Email *"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <Input
                label="Assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Dúvida, sugestão, parceria..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={6}
                  placeholder="Escreva sua mensagem aqui..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 
                             transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="lg" icon={Send} loading={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar mensagem'}
                </Button>
              </div>
            </form>
          </GlassPanel>
        </div>
      </div>
    </motion.div>
  );
};

export default ContatoPage;