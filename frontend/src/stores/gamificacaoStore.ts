import { create } from 'zustand';
import { fetchGamificacao, fetchRanking, type GamificacaoData, type RankingData } from '../services/api';

interface GamificacaoState {
  dados: GamificacaoData | null;
  ranking: RankingData | null;
  loading: boolean;
  carregar: (token: string) => Promise<void>;
  carregarRanking: (token: string) => Promise<void>;
}

export const useGamificacaoStore = create<GamificacaoState>((set) => ({
  dados: null,
  ranking: null,
  loading: false,

  carregar: async (token: string) => {
    set({ loading: true });
    try {
      const dados = await fetchGamificacao(token);
      set({ dados, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  carregarRanking: async (token: string) => {
    try {
      const ranking = await fetchRanking(token);
      set({ ranking });
    } catch {
      // Silencioso
    }
  },
}));