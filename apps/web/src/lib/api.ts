const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || error.statusCode);
  }

  return res.json();
}

export const api = {
  auth: {
    cadastro: (data: { email: string; senha: string; nome?: string }) =>
      request<{ access_token: string; usuario: { id: string; email: string } }>('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; senha: string }) =>
      request<{ access_token: string; usuario: { id: string; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    esqueceuSenha: (email: string) =>
      request<{ mensagem: string; reset_token?: string }>('/auth/esqueceu-senha', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    recuperarSenha: (token: string, novaSenha: string) =>
      request<{ mensagem: string }>('/auth/recuperar-senha', {
        method: 'POST',
        body: JSON.stringify({ token, novaSenha }),
      }),

    perfil: () => request<{ id: string; email: string; name: string; role: string }>('/auth/perfil'),
  },

  courses: {
    listar: () => request<any[]>('/courses'),

    detalhe: (id: string) => request<any>(`/courses/${id}`),
  },

  knowledge: {
    subjects: () => request<any[]>('/knowledge/subjects'),
  },

  learning: {
    modelo: (userId: string) => request<any[]>(`/learning/model/${userId}`),

    diagnosticos: (userId: string) => request<any[]>(`/learning/diagnostics/${userId}`),

    criarDiagnostico: (userId: string) => request<any>(`/learning/diagnostics/${userId}`, { method: 'POST' }),
  },

  ai: {
    conversas: (userId: string) => request<any[]>(`/ai/conversations/user/${userId}`),

    criarConversa: (userId: string, titulo?: string) =>
      request<any>('/ai/conversations', { method: 'POST', body: JSON.stringify({ userId, title: titulo }) }),

    enviarMensagem: (conversaId: string, role: string, content: string) =>
      request<any>(`/ai/conversations/${conversaId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ role, content }),
      }),

    obterConversa: (id: string) => request<any>(`/ai/conversations/${id}`),
  },
};
