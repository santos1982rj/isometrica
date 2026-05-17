/**
 * @file index.ts
 * @description Servidor Express principal da plataforma Nó na Armadura.
 * 
 * Registra todas as rotas da API e middlewares globais.
 * 
 * @see Rotas: src/routes/
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import dashboardRoutes from './routes/dashboard';
import gamificacaoRoutes from './routes/gamificacao';
import adminRoutes from './routes/admin';
import cursosRoutes from './routes/cursos';
import matriculasRoutes from './routes/matriculas';
import aulasRoutes from './routes/aulas';
import iaRoutes from './routes/ia';
import path from 'path';
import uploadRoutes from './routes/upload';
import anexosRoutes from './routes/anexos';
import contatoRoutes from './routes/contato';

const app = express();
const PORT = process.env.PORT || 3001;

/* ═══════════════════════════════════════════════════════════════
   Middlewares Globais
   ═══════════════════════════════════════════════════════════════ */

/** Permite requisições de qualquer origem (desenvolvimento) */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://static-site-production-3206.up.railway.app',
    'https://isometrica-production.up.railway.app',
    true, // Permite origens relativas (ex: quando o frontend está no mesmo domínio)
  ],
  credentials: true,
}));
/** Habilita parsing de JSON no corpo das requisições */
app.use(express.json());

/* ═══════════════════════════════════════════════════════════════
   Rotas Públicas
   ═══════════════════════════════════════════════════════════════ */

/** Rota de saúde: verifica se o servidor está online */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mensagem: 'Servidor rodando! Nó na Armadura online.',
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    mensagem: 'API Isométrica rodando!',
    timestamp: new Date().toISOString()
  });
});

/** Autenticação: registro e login */
app.use('/api/auth', authRoutes);

app.use('/api/ia', iaRoutes);


/** Cursos: listagem pública e detalhes */
app.use('/api/cursos', cursosRoutes);

/** Aulas: acesso ao conteúdo (público/restrito) */
app.use('/api/aulas', aulasRoutes);

// Servir arquivos da pasta uploads como estáticos
app.use('/api', anexosRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Registrar rota de upload
app.use('/api/upload', uploadRoutes);

app.use('/api', contatoRoutes);

/* ═══════════════════════════════════════════════════════════════
   Rotas Protegidas (exigem autenticação)
   ═══════════════════════════════════════════════════════════════ */

/** Usuários: perfil e edição */
app.use('/api/usuarios', usuariosRoutes);

/** Dashboard: dados agregados e atividades */
app.use('/api/dashboard', dashboardRoutes);

/** Gamificação: XP, níveis e ranking */
app.use('/api/gamificacao', gamificacaoRoutes);

/** Admin: gerenciamento de usuários (apenas ADMIN) */
app.use('/api/admin', adminRoutes);

/** Matrículas: matricular e listar cursos do usuário */
app.use('/api', matriculasRoutes);

/* ═══════════════════════════════════════════════════════════════
   Inicialização do Servidor
   ═══════════════════════════════════════════════════════════════ */

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 API disponível em http://localhost:${PORT}/api`);
});

