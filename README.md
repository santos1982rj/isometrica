# Isométrica

Plataforma inteligente de evolução acadêmica para estudantes de Engenharia.

## Stack

| Tecnologia | Versão |
|-----------|--------|
| Node.js | 22.14 LTS |
| pnpm | 11.5.2 |
| Turborepo | 2.9.16 |
| NestJS | 11.1.24 |
| Next.js | 16.2.7 |
| React | 19.2.7 |
| Prisma | 7.8.0 |
| PostgreSQL | 17 |
| Redis | 7 |
| Tailwind CSS | v4 |
| TanStack Query | ^5.101.0 |

## Requisitos

- Node.js >= 22.14.0
- pnpm >= 11.0.0 (instalar com `npm install -g pnpm`)
- PostgreSQL 17 (ou Neon gerenciado)
- Redis 7 (ou Redis gerenciado)
- Windows, macOS ou Linux

## Setup Local (Windows/PowerShell)

```powershell
# 1. Instalar dependências
pnpm install

# 2. Copiar variáveis de ambiente
copy .env.example .env
# Edite .env com suas credenciais

# 3. Subir banco (Docker)
docker compose up -d postgres redis

# 4. Rodar migrations
pnpm --filter @isometrica/api exec prisma migrate dev

# 5. Rodar seed (apenas desenvolvimento)
pnpm --filter @isometrica/api seed

# 6. Iniciar API
pnpm --filter @isometrica/api dev

# 7. Em outro terminal, iniciar Web
pnpm --filter @isometrica/web dev
```

## Variáveis de Ambiente

Ver `.env.example` para a lista completa.

### Obrigatórias
| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 64-char hex para assinar tokens |
| `GROQ_API_KEY` | Chave da API Groq (tutor IA) |
| `REDIS_URL` | Conexão Redis (event bus + cache) |

### Opcionais
| Variável | Descrição |
|----------|-----------|
| `RESEND_API_KEY` | Email transacional |
| `CORS_ORIGIN` | Origem permitida (default localhost:3000) |
| `PORT` | Porta da API (default 3001) |
| `JWT_EXPIRATION` | Expiração do token (default 7d) |

## Comandos

```powershell
# Desenvolvimento
pnpm dev                          # Inicia API + Web em paralelo
pnpm --filter @isometrica/api dev # Apenas API (http://localhost:3001)
pnpm --filter @isometrica/web dev # Apenas Web (http://localhost:3000)

# TypeScript
pnpm typecheck                    # Typecheck em todos os pacotes
pnpm --filter @isometrica/api typecheck
pnpm --filter @isometrica/web typecheck

# Testes
pnpm test                         # API + Web
pnpm --filter @isometrica/api test
pnpm --filter @isometrica/web test

# Build
pnpm build                        # Build de produção (4 pacotes)

# Banco de Dados
pnpm --filter @isometrica/api exec prisma validate      # Valida schema
pnpm --filter @isometrica/api exec prisma migrate dev   # Migration dev
pnpm --filter @isometrica/api exec prisma migrate deploy# Migration produção
pnpm --filter @isometrica/api seed                       # Seed (apenas dev)

# Lint
pnpm --filter @isometrica/web lint
pnpm --filter @isometrica/api lint

# E2E (Playwright)
pnpm --filter @isometrica/web test:e2e              # Terminal (headless)
pnpm --filter @isometrica/web test:e2e:ui            # UI mode (interativo)

**Pré-requisitos para E2E:**
- API rodando em `http://localhost:3001` (subir com `pnpm --filter @isometrica/api dev`)
- Banco com seed executado (`pnpm --filter @isometrica/api seed`)
- O comando `test:e2e` sobe o Next.js automaticamente na porta 3000

```powershell
# Terminal 1: API
pnpm --filter @isometrica/api dev

# Terminal 2: E2E (em outro terminal)
pnpm --filter @isometrica/web test:e2e
```

## Deploy

### Produção
- Web: Vercel (`apps/web`, build `next build`)
- API: Render (`render.yaml`, serviço `isometrica-api`)
- Banco: Neon (PostgreSQL gerenciado)
- Redis: Redis gerenciado (Upstash ou similar)
- DNS: Cloudflare → Vercel

### Arquitetura
```
isometrica.eng.br → Cloudflare → Vercel (Next.js)
  └→ rewrite /api/* → Render (NestJS)
       └→ Neon (PostgreSQL) + Redis
```

### Render (API)
O arquivo `render.yaml` contém a configuração do serviço.
Variáveis sensíveis devem ser configuradas no dashboard do Render.

**Migrations em produção:** O `render.yaml` inclui `postDeployCommand` que executa
`prisma migrate deploy` automaticamente após cada deploy. Não é necessário rodar
migrations manualmente — mas verifique o log do deploy para confirmar que passaram.

### Credenciais

```powershell
# Gerar JWT_SECRET seguro (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Configurar no dashboard do Render (variáveis sync: false)
# GROQ_API_KEY: https://console.groq.com/keys
# RESEND_API_KEY: https://resend.com/api-keys
# Neon: https://console.neon.tech
```

**Nunca commitar `.env` real.** Cada ambiente (dev, staging, produção)
deve ter seu próprio conjunto de chaves. Rotacione credenciais expostas
imediatamente nos dashboards correspondentes.

### Vercel (Web)
Projeto configurado como monorepo com root directory `apps/web`.
Variáveis de ambiente configuradas no dashboard da Vercel:
- `NEXT_PUBLIC_API_URL` → URL da API em produção

## Docker

```powershell
# Subir apenas banco
docker compose up -d postgres redis

# Subir tudo (banco + api)
docker compose up -d

# Parar tudo
docker compose down
```

## Seed

O seed cria dados de demonstração para desenvolvimento.
**Nunca execute em produção** — contém `deleteMany()` que destrói dados existentes.
Protegido por verificação de `NODE_ENV`.

## Observações para Windows

- Use PowerShell 5.1+
- Para variáveis de ambiente, prefira editar o arquivo `.env`
- Docker Desktop requer WSL2 habilitado
- Caminhos com espaços: usar aspas duplas
