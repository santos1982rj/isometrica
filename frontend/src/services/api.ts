/**
 * @file api.ts
 * @description Configuração base para chamadas à API do backend.
 * 
 * Centraliza a URL base da API e funções utilitárias de requisição.
 * 
 * @see authService: src/services/authService.ts
 * @see Backend: backend/src/index.ts
 */

/** URL base do backend. Em produção, usar variável de ambiente. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);


/** Estrutura de resposta esperada da rota de saúde */
export interface HealthResponse {
  status: string;
  mensagem: string;
}

/**
 * Verifica se o backend está respondendo.
 * Útil para diagnóstico e indicadores de status na UI.
 * 
 * @returns Dados de saúde do servidor
 * @throws Erro se o backend não responder
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/** Tipos de resposta do dashboard */
export interface DashboardData {
  estatisticas: {
    usuariosAtivos: number;
    calculosRealizados: number;
    exerciciosResolvidos: number;
    horasEstudo: number;
    pontuacao: number;
    diasAtivo: number;
  };
}

export interface Atividade {
  id: number;
  tipo: string;
  descricao: string;
  data: string;
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: 'info' | 'conquista' | 'sistema' | 'lembrete';
  data: string;
}

/** Dados da matrícula retornados pela API */
export interface MatriculaResponse {
  id: number;
  userId: number;
  cursoId: number;
  status: string;
  progresso: number;
  concluido: boolean;
  createdAt: string;
}

/**
 * Busca dados do dashboard.
 */
export async function fetchDashboard(token: string): Promise<DashboardData> {
  const resposta = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao carregar dashboard.');
  return resposta.json();
}

/**
 * Busca últimas atividades.
 */
export async function fetchAtividades(token: string): Promise<{ atividades: Atividade[] }> {
  const resposta = await fetch(`${API_BASE_URL}/dashboard/atividades`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao carregar atividades.');
  return resposta.json();
}

/**
 * Busca notificações.
 */
export async function fetchNotificacoes(token: string): Promise<{ notificacoes: Notificacao[] }> {
  const resposta = await fetch(`${API_BASE_URL}/dashboard/notificacoes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao carregar notificações.');
  return resposta.json();
}

export interface GamificacaoData {
  usuario: {
    id: number;
    nome: string;
    nivel: number;
    xpTotal: number;
    xpAtual: number;
    xpProximoNivel: number;
    streak: number;
    titulo: string;
  };
  conquistas: {
    id: number;
    titulo: string;
    descricao: string;
    icone: string;
    cor: string;
    desbloqueada: boolean;
    desbloqueadaEm?: string;
  }[];
  progresso: {
    data: string;
    xpGanho: number;
    calculos: number;
    exercicios: number;
  }[];
}

export interface RankingData {
  ranking: {
    posicao: number;
    id: number;
    nome: string;
    nivel: number;
    xpTotal: number;
    streak: number;
    avatar: string | null;
  }[];
  minhaPosicao: number;
}

export async function fetchGamificacao(token: string): Promise<GamificacaoData> {
  const resposta = await fetch(`${API_BASE_URL}/gamificacao`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao carregar gamificação.');
  return resposta.json();
}

export async function fetchRanking(token: string): Promise<RankingData> {
  const resposta = await fetch(`${API_BASE_URL}/gamificacao/ranking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao carregar ranking.');
  return resposta.json();
}

/* ═══════════════════════════════════════════════════════════════
   TIPOS DE CURSOS
   ═══════════════════════════════════════════════════════════════ */

export interface CursoCard {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  imagem: string | null;
  preco: number | null;
  nivel: string;
  cargaHoraria: number | null;
  _count: { matriculas: number };
  modulos: {
    aulas: { id: number; videoUrl: string | null;   // ← Adicionar
      conteudo: string | null;   // ← Adicionar
      }[];
  }[];
}

export interface CursoDetalhe {
  id: number;
  titulo: string;
  slug: string;
  descricao: string;
  resumo: string | null;
  imagem: string | null;
  preco: number | null;
  nivel: string;
  cargaHoraria: number | null;
  categoria: string | null;
  modulos: {
    id: number;
    titulo: string;
    descricao: string | null;  // ← Adicionado
    ordem: number;
    aulas: {
      id: number;
      titulo: string;
      slug: string;
      duracao: number | null;
      gratuito: boolean;
      ordem: number;
      videoUrl: string | null;  // ← Adicionar
      conteudo: string | null;   // ← Adicionar
    }[];
  }[];
  _count: { matriculas: number };
}

export interface MeuCurso {
  id: number;
  titulo: string;
  slug: string;
  imagem: string | null;
  status: string;
  progresso: number;
  concluido: boolean;
  totalAulas: number;
  matriculaId: number;
}

/* ═══════════════════════════════════════════════════════════════
   FUNÇÕES DE CURSOS
   ═══════════════════════════════════════════════════════════════ */

export async function fetchCursos(): Promise<{ cursos: CursoCard[] }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos`);
  if (!resposta.ok) throw new Error('Erro ao carregar cursos.');
  return resposta.json();
}

export async function fetchCursoPorSlug(slug: string): Promise<{ curso: CursoDetalhe }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${slug}`);
  if (!resposta.ok) throw new Error('Curso não encontrado.');
  return resposta.json();
}

/**
 * Matricula o usuário em um curso.
 */
export async function matricular(
  cursoId: number,
  token: string
): Promise<{
  mensagem: string;
  matricula: MatriculaResponse;
  requerPagamento: boolean;
}> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/matricular`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao matricular.');
  }

  return dados;
}

/**
 * Lista os cursos do usuário logado.
 */
export async function fetchMeusCursos(
  token: string
): Promise<{ cursos: MeuCurso[] }> {
  const resposta = await fetch(`${API_BASE_URL}/meus-cursos`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao carregar seus cursos.');
  }

  return dados;
}

/* ═══════════════════════════════════════════════════════════════
   FUNÇÕES ADMIN
   ═══════════════════════════════════════════════════════════════ */

/**
 * Cria um novo curso (requer token de PROFESSOR ou ADMIN).
 */
export async function criarCurso(
  dados: {
    titulo: string;
    descricao: string;
    resumo?: string;
    preco?: number | null;
    cargaHoraria?: number;
    nivel?: string;
    categoria?: string;
  },
  token: string
): Promise<{ mensagem: string; curso: CursoDetalhe }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  const dadosResposta = await resposta.json();
  if (!resposta.ok) throw new Error(dadosResposta.erro || 'Erro ao criar curso.');
  return dadosResposta;
}

/**
 * Deleta um curso (requer token de ADMIN).
 */
export async function deletarCurso(
  id: number,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao deletar curso.');
  return dados;
}

/* ═══════════════════════════════════════════════════════════════
   TIPOS DE AULAS
   ═══════════════════════════════════════════════════════════════ */

export interface AulaDetalhe {
  id: number;
  titulo: string;
  slug: string;
  descricao: string | null;
  conteudo: string | null;
  videoUrl: string | null;
  duracao: number | null;
  ordem: number;
  gratuito: boolean;
  bloqueada: boolean;
}

export interface CursoNav {
  id: number;
  titulo: string;
  slug: string;
  modulos: {
    id: number;
    titulo: string;
    ordem: number;
    aulas: {
      id: number;
      titulo: string;
      slug: string;
      duracao: number | null;
      gratuito: boolean;
      ordem: number;
    }[];
  }[];
}

/* ═══════════════════════════════════════════════════════════════
   FUNÇÕES DE AULAS
   ═══════════════════════════════════════════════════════════════ */
/** Dados de progresso de uma aula */
export interface ProgressoAulaData {
  id: number;
  userId: number;
  aulaId: number;
  concluida: boolean;
  tempoAssistido: number | null;
  notas: string | null;
  concluidaEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAula(
  slug: string,
  token?: string | null
): Promise<{
  aula: AulaDetalhe;
  modulo: { id: number; titulo: string; ordem: number };
  curso: CursoNav;
  progresso: ProgressoAulaData | null;
  matriculado: boolean;
}> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_BASE_URL}/aulas/${slug}`, { headers });
  if (!resposta.ok) throw new Error('Aula não encontrada.');
  return resposta.json();
}

export async function concluirAula(
  id: number,
  token: string
): Promise<{ mensagem: string; progresso: ProgressoAulaData }> {
  const resposta = await fetch(`${API_BASE_URL}/aulas/${id}/concluir`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Erro ao concluir aula.');
  return resposta.json();
}

/* ═══════════════════════════════════════════════════════════════
   TIPOS DE ADMIN
   ═══════════════════════════════════════════════════════════════ */

export interface ModuloAdmin {
  id: number;
  titulo: string;
  descricao: string | null;
  ordem: number;
  cursoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AulaAdmin {
  id: number;
  titulo: string;
  slug: string;
  descricao: string | null;
  conteudo: string | null;
  videoUrl: string | null;
  duracao: number | null;
  ordem: number;
  gratuito: boolean;
  moduloId: number;
  createdAt: string;
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════
   FUNÇÕES DE ADMIN - MÓDULOS E AULAS
   ═══════════════════════════════════════════════════════════════ */

export async function criarModulo(
  cursoId: number,
  dados: { titulo: string; descricao?: string },
  token: string
): Promise<{ mensagem: string; modulo: ModuloAdmin }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao criar módulo.');
  return data;
}

export async function atualizarModulo(
  cursoId: number,
  moduloId: number,
  dados: { titulo?: string; descricao?: string; ordem?: number },
  token: string
): Promise<{ mensagem: string; modulo: ModuloAdmin }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos/${moduloId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao atualizar módulo.');
  return data;
}

export async function deletarModulo(
  cursoId: number,
  moduloId: number,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos/${moduloId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao excluir módulo.');
  return data;
}

export async function criarAula(
  cursoId: number,
  moduloId: number,
  dados: {
    titulo: string;
    descricao?: string;
    conteudo?: string;
    videoUrl?: string;
    duracao?: number;
    gratuito?: boolean;
  },
  token: string
): Promise<{ mensagem: string; aula: AulaAdmin }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos/${moduloId}/aulas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao criar aula.');
  return data;
}

export async function atualizarAula(
  cursoId: number,
  moduloId: number,
  aulaId: number,
  dados: {
    titulo?: string;
    descricao?: string;
    conteudo?: string;
    videoUrl?: string;
    duracao?: number;
    gratuito?: boolean;
    ordem?: number;
  },
  token: string
): Promise<{ mensagem: string; aula: AulaAdmin }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos/${moduloId}/aulas/${aulaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao atualizar aula.');
  return data;
}

export async function deletarAula(
  cursoId: number,
  moduloId: number,
  aulaId: number,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos/${moduloId}/aulas/${aulaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao excluir aula.');
  return data;
}
export async function atualizarCurso(
  id: number,
  dados: {
    titulo?: string;
    descricao?: string;
    resumo?: string;
    preco?: number | null;
    cargaHoraria?: number;
    nivel?: string;
    categoria?: string;
  },
  token: string
): Promise<{ mensagem: string; curso: CursoDetalhe }> {
  const resposta = await fetch(`${API_BASE_URL}/cursos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const dadosResposta = await resposta.json();
  if (!resposta.ok) throw new Error(dadosResposta.erro || 'Erro ao atualizar curso.');
  return dadosResposta;
}

export async function atualizarAvatar(
  id: number,
  avatar: string | null,
  token: string
): Promise<{
  mensagem: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
    nivel: number;
    avatar: string | null;
    createdAt: string;
  };
}> {
  const resposta = await fetch(`${API_BASE_URL}/usuarios/${id}/avatar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatar }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao atualizar avatar.');
  }

  return dados;
}



/* ═══════════════════════════════════════════════════════════════
   TIPOS COMPARTILHADOS
   ═══════════════════════════════════════════════════════════════ */

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
  nivel: number;
  avatar: string | null;
  createdAt: string;
}

export interface AdminUsuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  nivel: number;
  xpTotal: number;
  createdAt: string;
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════════════════════════ */

export async function fetchUsuarios(token: string): Promise<{ usuarios: AdminUsuario[] }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error('Acesso negado.');
  return resposta.json();
}

export async function alterarRole(
  id: number,
  role: string,
  token: string
): Promise<{ mensagem: string; usuario: AdminUsuario }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao alterar role.');
  return dados;
}

/* ═══════════════════════════════════════════════════════════════
   RECUPERAÇÃO DE SENHA
   ═══════════════════════════════════════════════════════════════ */

export async function esqueciSenha(email: string): Promise<{ mensagem: string; token?: string; link?: string }> {
  const resposta = await fetch(`${API_BASE_URL}/auth/esqueci-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao solicitar recuperação.');
  return dados;
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/auth/redefinir-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, novaSenha }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao redefinir senha.');
  return dados;
}

// atualizarPerfil
export async function atualizarPerfil(
  id: number,
  dados: { nome: string },
  token: string
): Promise<{ mensagem: string; usuario: Usuario }> {
  const resposta = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const dadosResposta = await resposta.json();
  if (!resposta.ok) throw new Error(dadosResposta.erro || 'Erro ao atualizar perfil.');
  return dadosResposta;
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN - CRUD DE USUÁRIOS
   ═══════════════════════════════════════════════════════════════ */

export interface AdminUsuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  status: string;
  nivel: number;
  xpTotal: number;
  avatar: string | null;
  createdAt: string;
}

export async function criarUsuario(
  dados: { nome: string; email: string; senha: string; role?: string; status?: string },
  token: string
): Promise<{ mensagem: string; usuario: AdminUsuario }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao criar usuário.');
  return data;
}

export async function editarUsuario(
  id: number,
  dados: { nome?: string; email?: string; role?: string; status?: string },
  token: string
): Promise<{ mensagem: string; usuario: AdminUsuario }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(dados),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao editar usuário.');
  return data;
}

export async function alterarStatusUsuario(
  id: number,
  status: string,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao alterar status.');
  return data;
}

export async function excluirUsuario(
  id: number,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/admin/usuarios/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro ao excluir usuário.');
  return data;
}

/* ═══════════════════════════════════════════════════════════════
   ANEXOS
   ═══════════════════════════════════════════════════════════════ */

export interface AnexoData {
  id: number;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number | null;
  aulaId: number;
  createdAt: string;
}

export async function uploadAnexo(
  aulaId: number,
  file: File,
  token: string
): Promise<{ mensagem: string; anexo: AnexoData }> {
  const formData = new FormData();
  formData.append('arquivo', file);

  const resposta = await fetch(`${API_BASE_URL}/aulas/${aulaId}/anexos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao enviar arquivo.');
  return dados;
}

export async function fetchAnexos(aulaId: number): Promise<{ anexos: AnexoData[] }> {
  const resposta = await fetch(`${API_BASE_URL}/aulas/${aulaId}/anexos`);
  if (!resposta.ok) throw new Error('Erro ao carregar anexos.');
  return resposta.json();
}

export async function deletarAnexo(id: number, token: string): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/anexos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao excluir anexo.');
  return dados;
}

export function getDownloadUrl(anexoId: number): string {
  return `${API_BASE_URL}/anexos/${anexoId}/download`;
}