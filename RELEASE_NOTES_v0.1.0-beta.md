# Release Notes — v0.1.0-beta

## Versão

**v0.1.0-beta** — Beta Interno

| Campo | Valor |
|-------|-------|
| Commit | `7b05580` |
| Data | 13/06/2026 |
| Tag | `v0.1.0-beta` |
| Branch | `main` |

---

## Funcionalidades Disponíveis

### Aluno
- Dashboard com KPIs (XP, streak, level, cursos ativos)
- Catálogo de cursos com cards e gradiente dinâmico
- Landing page do curso com hero, ementa, professor, matrícula/compra
- Player de vídeo (embed YouTube), quiz, anotações com auto-save
- Progresso por tópico com donut chart e barra de proficiência
- Gamificação (XP, level, streak, conquistas, missões, ranking)
- Tutor IA com streaming (Groq)
- Modo Concurso com simulados cronometrados
- Banco de Questões com árvore de tópicos, filtros, estatísticas
- Feed de Erros com refazer questões
- Certificados com compartilhamento no LinkedIn
- Perfil público compartilhável (`/u/[id]`)
- Planos de assinatura (Gratuito / Premium)

### Professor
- Dashboard com analytics (cursos, alunos, taxa de acerto)
- CRUD de cursos com wizard de 4 etapas
- Gerenciamento de módulos e aulas (vídeo/texto)
- Criação de questões com alternativas, dificuldade, nível de Bloom
- Gerenciamento de concursos/provas

### Admin
- Dashboard com KPIs da plataforma (MRR, churn, usuários)
- Gestão de usuários (listar, buscar, alterar papel, remover)
- Visão financeira (assinaturas, receita, distribuição de planos)

### Infraestrutura
- Autenticação JWT com cookie httpOnly
- Middleware com proteção de rotas por role
- RBAC no backend (Student, Professor, Admin)
- Rate limiting (60 req/min global)
- Sanitização de inputs (SanitizePipe)
- Cache headers em GET
- Swagger/OpenAPI em `/api/docs`
- CI via GitHub Actions (install, validate, typecheck, build, test)
- Docker compose para desenvolvimento local

---

## Correções Críticas

| # | Problema | Causa | Correção |
|---|----------|-------|----------|
| 1 | Gamificação nunca funcionava | Handler escutava evento errado (`QUESTION_ANSWERED` vs `QUESTION_CORRECT/INCORRECT`) | Handler migrado para eventos corretos |
| 2 | Cursos retornavam 401 | Controllers sem `@Public()` nos endpoints GET | Adicionado `@Public()` |
| 3 | Scrollbar com cor inválida | `hsl(var(--border))` em globals.css | Corrigido para `var(--border)` |
| 4 | API travava no startup local | `PrismaNeon` usava WebSocket para banco local | `@prisma/adapter-pg` com TCP |
| 5 | Login 500 em produção | Pooler Neon desabilitado + `-pooler` na URL | URL direta ao compute (sem pooler) |
| 6 | Login 500 em produção | `@prisma/adapter-neon` via WebSocket no Render | `@prisma/adapter-pg` sempre (TCP) |
| 7 | Erro 500 não logava | `AllExceptionsFilter` sem `console.error` | Log adicionado |
| 8 | Docker healthcheck quebrado | Porta 4000 no EXPOSE, API escutava 3001 | Porta e healthcheck corrigidos |
| 9 | Seed destrutivo em produção | `deleteMany()` sem proteção | Guard `NODE_ENV === 'production'` |
| 10 | Sidebar "Turmas" e "Analytics" com `href="#"` | Links para rotas inexistentes | Badge "Em breve" não clicável |
| 11 | Aluno acessava área professor/admin | Middleware só verificava token, não role | Middleware decodifica role do JWT |
| 12 | Acadêmico na sidebar não navegava | Itens sem `<Link>` | Envoltos em `<Link>` |

---

## Riscos Conhecidos

| Risco | Impacto | Notas |
|-------|---------|-------|
| Neon auto-suspende compute | Primeira requisição após inatividade pode demorar ~3s | Compute acorda automaticamente |
| Sem Redis (event bus in-memory) | Eventos perdidos se API reiniciar | Aceitável para beta |
| Status publicado/rascunho não existe | Professor não vê indicador visual | Funcionalidade futura |
| Streak decay não implementado | Streak só aumenta, nunca decai | Requer job agendado |
| Refresh token ausente | Sessão JWT sem refresh | Pode expirar inesperadamente |
| Rate limiting 60 req/min global | Pode ser agressivo para IA streaming | Ajustável no AppModule |
| Sem monitoramento Sentry | Erros silenciosos em produção | Recomendado pós-beta |
| E2E executado apenas localmente | CI sem banco/API para E2E | Job desabilitado (`if: false`) |
| Node 26 no Render | `bcrypt` pode ter incompatibilidade | Testado e funcionando |

---

## Checklist Pós-Deploy

- [x] Health endpoint responde 200 (`/api/health`)
- [x] Login com aluno funciona
- [x] Login com professor funciona
- [x] Login com admin funciona
- [ ] Logout funciona
- [ ] Dashboard do aluno carrega com KPIs
- [ ] Catálogo de cursos carrega
- [ ] Landing page do curso carrega
- [ ] Player de aula carrega
- [ ] Gamificação carrega sem erro
- [ ] Modo Concurso lista simulados
- [ ] Professor dashboard carrega
- [ ] Admin dashboard carrega
- [ ] Sidebar com opções corretas por role
- [ ] Rotas protegidas redirecionam corretamente
- [ ] Responsividade mobile OK
- [ ] Tema escuro/claro alterna

---

## Próximos Passos

### Curto prazo (pós-beta)
- [ ] Coletar feedback dos testadores
- [ ] Resolver bugs críticos reportados
- [ ] Limpar warnings de lint (React hooks, imports não usados)
- [ ] Ativar job E2E no CI

### Médio prazo
- [ ] Implementar refresh token
- [ ] Configurar Sentry para monitoramento
- [ ] Ajustar rate limiting para endpoints de IA
- [ ] Adicionar status publicado/rascunho
- [ ] Implementar streak decay

### Longo prazo
- [ ] Upload real de arquivos (S3/bucket)
- [ ] Turmas e Analytics avançado
- [ ] Testes E2E completos em CI
- [ ] Pipeline CD automatizado
- [ ] v1.0.0 — Produção
