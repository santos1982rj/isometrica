# Riscos Conhecidos — Isométrica (Beta)

## Funcionalidades Não Implementadas

| Risco | Impacto | Notas |
|-------|---------|-------|
| Status publicado/rascunho não existe no schema | Professor não vê indicador visual de publicação | Requer coluna no schema Prisma + migration |
| Turmas não implementado | Item desabilitado na sidebar do professor | Funcionalidade futura |
| Analytics avançado não implementado | Item desabilitado na sidebar do admin | Funcionalidade futura |
| Upload real de arquivos não implementado | Materiais são URLs externas (YouTube, links) | Sem bucket S3/configurado |
| Streak decay não implementado | Streak só aumenta, nunca decai | Requer job agendado |
| SIMULADO_FINISHED não persistido em Event | Evento de fim de simulado não trackeado | Faltando mapeamento no AnalyticsEventHandler |
| Unique constraint para achievements não existe | Usuário pode ter achievements duplicados | Requer migration + índice composto |
| Refresh token / session lifecycle | Sessão baseada apenas em JWT sem refresh | Pode expirar inesperadamente |

## Riscos Operacionais

| Risco | Mitigação |
|-------|-----------|
| Seed com deleteMany é perigoso em produção | Protegido por verificação NODE_ENV |
| Chave JWT exposta no git anteriormente | Rotação manual necessária (dashboard Neon/Render) |
| GROQ_API_KEY exposta no git | Rotação manual necessária |
| Sem testes E2E | Cobertura apenas unitária + integração |
| Sem monitoramento de erros | Sem Sentry/Logtail configurado |
| Rate limiting global (60 req/min) | Pode ser agressivo para endpoints de IA streaming |
| Dockerfile healthcheck usa node -e | Sem dependência externa (wget removido) |
| Prisma generate requer DATABASE_URL durante build | Variável deve estar disponível no ambiente de build |
| Render sem postDeployCommand anteriormente | Agora configurado com prisma migrate deploy |

## Lint — Warnings Conhecidos

O lint do projeto tem warnings preexistentes e não bloqueantes:

| Pacote | Erros | Warnings | Observação |
|--------|-------|----------|------------|
| `@isometrica/api` | 0 | 63 | Apenas variáveis não usadas em arquivos de teste |
| `@isometrica/web` | 11 | 112 | React hooks rules (set-state-in-effect) + imports não usados |

Os erros do web não afetam runtime. O CI executa apenas o lint da API (0 erros).
A limpeza completa dos warnings está agendada para pós-beta.

## Recomendações Pré-Produção

1. Rotacionar JWT_SECRET, GROQ_API_KEY e senha do Neon (credenciais expostas em git anteriormente)
2. Configurar monitoramento (Sentry ou similar)
3. Adicionar testes E2E para fluxos críticos (login, curso, aula)
4. Configurar backup automático do banco
5. Revisar rate limiting para endpoints de IA streaming
6. Implementar refresh token
7. Configurar CI/CD completo (GitHub Actions já configurado)
8. Revisar termos de uso e política de privacidade

## Credenciais e Rotação

| Recurso | Ação Necessária |
|---------|-----------------|
| JWT_SECRET | Gerar com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| GROQ_API_KEY | Criar em https://console.groq.com/keys |
| Senha do Neon | Rotacionar no dashboard https://console.neon.tech |
| RESEND_API_KEY | Criar em https://resend.com/api-keys |

**Nunca commitar `.env` real.** Sempre usar `.env.example` como template e adicionar `.env` ao `.gitignore`.
Cada ambiente (dev, staging, produção) deve ter seu próprio conjunto de chaves.

## Rate Limiting

O throttle global está configurado para **60 requisições por minuto** por IP.
Endpoints de IA streaming (`POST /ai/chat`, `POST /ai/tutor`) podem exigir limite específico em produção,
pois o streaming gera múltiplas requisições longas. Ajustar no `AppModule` se necessário:

```
ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])
```

Para endpoints de IA, considerar aumentar o limite ou criar módulo separado com configuração própria.
