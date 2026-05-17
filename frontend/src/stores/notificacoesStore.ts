/**
 * @file notificacoesStore.ts
 * @description Store Zustand para gerenciar notificações.
 */

import { create } from 'zustand';
import { fetchNotificacoes, type Notificacao } from '../services/api';

interface NotificacoesState {
  notificacoes: Notificacao[];
  naoLidas: number;
  loading: boolean;
  carregar: (token: string) => Promise<void>;
  marcarComoLida: (id: number) => void;
  marcarTodasComoLidas: () => void;
}

export const useNotificacoesStore = create<NotificacoesState>((set, get) => ({
  notificacoes: [],
  naoLidas: 0,
  loading: false,

  carregar: async (token: string) => {
    set({ loading: true });
    try {
      const data = await fetchNotificacoes(token);
      set({
        notificacoes: data.notificacoes,
        naoLidas: data.notificacoes.filter((n) => !n.lida).length,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  marcarComoLida: (id: number) => {
    const notificacoes = get().notificacoes.map((n) =>
      n.id === id ? { ...n, lida: true } : n
    );
    set({
      notificacoes,
      naoLidas: notificacoes.filter((n) => !n.lida).length,
    });
  },

  marcarTodasComoLidas: () => {
    const notificacoes = get().notificacoes.map((n) => ({ ...n, lida: true }));
    set({ notificacoes, naoLidas: 0 });
  },
}));