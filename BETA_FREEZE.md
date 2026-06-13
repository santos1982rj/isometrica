# Congelamento do Beta Interno — Isométrica

## Branch/Tag Sugerida

- Branch: `main` (ou `release/beta-interno` se quiser isolar)
- Tag: `v0.1.0-beta`

## Comandos Obrigatórios Antes do Beta

```powershell
# 1. Instalar dependências
pnpm install --frozen-lockfile

# 2. Validar schema
pnpm --filter @isometrica/api exec prisma validate

# 3. Typecheck
pnpm typecheck

# 4. Testes unitários
pnpm test

# 5. Build
pnpm build

# 6. Lint
pnpm lint
```

## Checklist Manual Obrigatório

- [ ] Login com aluno, professor e admin
- [ ] Logout e login novamente
- [ ] Aluno: dashboard carrega com KPIs
- [ ] Aluno: acessa curso, módulo, aula
- [ ] Aluno: player de vídeo carrega
- [ ] Aluno: responde questão em aula
- [ ] Aluno: gamificação aparece (XP, level, streak)
- [ ] Aluno: modo concurso lista e inicia simulado
- [ ] Aluno: feed de erros funciona
- [ ] Professor: dashboard carrega
- [ ] Professor: cria curso (wizard)
- [ ] Professor: adiciona módulo e aula
- [ ] Professor: gerencia questões
- [ ] Admin: dashboard carrega
- [ ] Admin: gerencia usuários
- [ ] Mobile: páginas principais responsivas
- [ ] Sidebar: navegação funcional
- [ ] Tema escuro/claro alterna

## Checklist E2E

```powershell
# Terminal 1: API
pnpm --filter @isometrica/api dev

# Terminal 2: Web + E2E
pnpm --filter @isometrica/web test:e2e
```

- [ ] auth.spec.ts — 8 testes
- [ ] student.spec.ts — 10 testes
- [ ] professor.spec.ts — 4 testes
- [ ] ownership.spec.ts — 2 testes
- [ ] sanity.spec.ts — 5 testes
- [ ] simulado.spec.ts — 2 testes
- [ ] professor-create-course.spec.ts — 2 testes

## Credenciais a Rotacionar (BLOQUEANTE para beta público)

| Recurso | Ação | Dashboard |
|---------|------|-----------|
| JWT_SECRET | Gerar novo: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Render / Neon |
| GROQ_API_KEY | Criar nova chave | https://console.groq.com/keys |
| Senha Neon | Rotacionar | https://console.neon.tech |
| RESEND_API_KEY | Criar se for usar email | https://resend.com/api-keys |

## Variáveis de Ambiente a Revisar

Aplicação (Render / Vercel):
- [ ] DATABASE_URL aponta para Neon produção
- [ ] JWT_SECRET é forte e único por ambiente
- [ ] CORS_ORIGIN inclui domínio de produção
- [ ] REDIS_URL aponta para Redis gerenciado
- [ ] NEXT_PUBLIC_API_URL aponta para Render API

## Riscos Aceitos (não bloqueiam beta)

| Risco | Justificativa |
|-------|---------------|
| Status publicado/rascunho não existe | Funcionalidade futura, schema sem campo |
| Turmas não implementado | Sidebar com "Em breve" |
| Analytics avançado não implementado | Sidebar com "Em breve" |
| Streak decay não implementado | Streak só aumenta |
| Refresh token ausente | Sessão JWT sem refresh |
| Sem monitoramento Sentry | Recomendado pós-beta |
| Rate limiting 60 req/min global | Pode ser ajustado se necessário |
| E2E executa apenas localmente | CI sem banco/API para E2E |

## Plano de Rollback

1. **Reverter deploy Vercel**: Dashboard Vercel → Deployments → ⋮ → Promote
2. **Reverter deploy Render**: Dashboard Render → Deployments → Rollback
3. **Reverter migration**: `pnpm --filter @isometrica/api exec prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma`
4. **Restore banco**: Neon → Branch → Restore (Point-in-Time)
5. **Voltar tag git**: `git checkout v0.1.0-beta-anterior`

## Observações sobre Lint

`pnpm --filter @isometrica/web lint` produz **11 erros** preexistentes (React hooks rules:
`set-state-in-effect`, `immutability`, `purity`) e **112 warnings** (variáveis não usadas).
Esses erros não afetam runtime — são código funcional que fere regras estilísticas do
`eslint-config-next`. Não bloqueiam o beta.

`pnpm --filter @isometrica/api lint` produz **0 erros** e **63 warnings** (variáveis não usadas
em arquivos de teste). O CI executa o lint da API, que passa limpo.

## Passos Finais da Tag v0.1.0-beta

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm --filter @isometrica/api exec prisma validate`
- [ ] `pnpm lint` (esperado: API passa, web tem erros conhecidos)
- [ ] `pnpm test` (122 testes unitários)
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Rodar E2E local: `pnpm --filter @isometrica/web test:e2e` (API + banco local)
- [ ] Rotacionar credenciais (JWT_SECRET, GROQ_API_KEY, Neon)
- [ ] Criar tag git: `git tag v0.1.0-beta && git push origin v0.1.0-beta`
- [ ] Deploy Render: verificar dashboard, env vars, migrations
- [ ] Deploy Vercel: verificar dashboard, env vars
- [ ] Smoke test pós-deploy: login, dashboard, curso, aula, gamificação
- [ ] Liberar acesso ao beta interno

## Após Beta

- [ ] Coletar feedback dos testadores
- [ ] Resolver bugs críticos
- [ ] Limpar warnings de lint (React hooks, imports não usados)
- [ ] Implementar refresh token
- [ ] Configurar Sentry
- [ ] Ajustar rate limiting
- [ ] Ativar job E2E no CI
- [ ] Planejar ciclo beta → produção
