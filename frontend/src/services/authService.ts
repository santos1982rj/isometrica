/**
 * @file authService.ts
 * @description Serviço de autenticação – chamadas HTTP para registro, login e perfil.
 * 
 * Centraliza as requisições ao backend relacionadas a autenticação,
 * mantendo a lógica de rede isolada da interface.
 * 
 * @see Backend: backend/src/routes/auth.ts
 * @see Backend: backend/src/routes/usuarios.ts
 */

import { API_BASE_URL } from './api';

/** Estrutura de resposta esperada do backend após registro/login/atualização */
export interface AuthResponse {
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
  token?: string;
}

/**
 * Envia requisição de registro para o backend.
 * 
 * @param nome - Nome completo do usuário
 * @param email - Email (único)
 * @param senha - Senha (mínimo 6 caracteres)
 * @returns Dados do usuário + token JWT
 * @throws Erro com mensagem do backend ou erro de rede
 */
export async function registrar(
  nome: string,
  email: string,
  senha: string
): Promise<AuthResponse> {
  const resposta = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao criar conta.');
  }

  return dados;
}

/**
 * Envia requisição de login para o backend.
 * 
 * @param email - Email cadastrado
 * @param senha - Senha da conta
 * @returns Dados do usuário + token JWT
 * @throws Erro com mensagem do backend ou erro de rede
 */
export async function login(
  email: string,
  senha: string
): Promise<AuthResponse> {
  const resposta = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao fazer login.');
  }

  return dados;
}

/**
 * Atualiza o perfil do usuário no backend.
 * Requer autenticação (token JWT).
 * 
 * @param id - ID do usuário
 * @param dados - Campos a serem atualizados ({ nome: string })
 * @param token - Token JWT para autorização
 * @returns Dados atualizados do usuário
 * @throws Erro com mensagem do backend ou erro de rede
 */
export async function atualizarPerfil(
  id: number,
  dados: { nome: string },
  token: string
): Promise<AuthResponse> {
  const resposta = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  const dadosResposta = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dadosResposta.erro || 'Erro ao atualizar perfil.');
  }

  return dadosResposta;
}

/**
 * Altera a senha do usuário.
 * Requer autenticação (token JWT).
 * 
 * @param id - ID do usuário
 * @param senhaAtual - Senha atual para confirmação
 * @param novaSenha - Nova senha (mínimo 6 caracteres)
 * @param token - Token JWT para autorização
 * @returns Mensagem de sucesso
 * @throws Erro com mensagem do backend ou erro de rede
 */
export async function alterarSenha(
  id: number,
  senhaAtual: string,
  novaSenha: string,
  token: string
): Promise<{ mensagem: string }> {
  const resposta = await fetch(`${API_BASE_URL}/usuarios/${id}/senha`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ senhaAtual, novaSenha }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao alterar senha.');
  }

  return dados;
}