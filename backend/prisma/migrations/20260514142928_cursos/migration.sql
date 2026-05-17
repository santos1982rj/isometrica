-- CreateTable
CREATE TABLE "Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "resumo" TEXT,
    "imagem" TEXT,
    "preco" REAL,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "cargaHoraria" INTEGER,
    "nivel" TEXT NOT NULL DEFAULT 'INICIANTE',
    "categoria" TEXT,
    "criadoPorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Modulo_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "conteudo" TEXT,
    "videoUrl" TEXT,
    "duracao" INTEGER,
    "ordem" INTEGER NOT NULL,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "moduloId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Aula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER,
    "aulaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Anexo_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "progresso" REAL NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "pagamentoId" TEXT,
    "valorPago" REAL,
    "dataConclusao" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Matricula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Matricula_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressoAula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "tempoAssistido" INTEGER,
    "notas" TEXT,
    "concluidaEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressoAula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressoAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProgressoDiario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpGanho" INTEGER NOT NULL DEFAULT 0,
    "calculos" INTEGER NOT NULL DEFAULT 0,
    "exercicios" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgressoDiario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProgressoDiario" ("calculos", "data", "exercicios", "id", "userId", "xpGanho") SELECT "calculos", "data", "exercicios", "id", "userId", "xpGanho" FROM "ProgressoDiario";
DROP TABLE "ProgressoDiario";
ALTER TABLE "new_ProgressoDiario" RENAME TO "ProgressoDiario";
CREATE UNIQUE INDEX "ProgressoDiario_userId_data_key" ON "ProgressoDiario"("userId", "data");
CREATE TABLE "new_UsuarioConquista" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "conquistaId" INTEGER NOT NULL,
    "desbloqueadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsuarioConquista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsuarioConquista_conquistaId_fkey" FOREIGN KEY ("conquistaId") REFERENCES "Conquista" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UsuarioConquista" ("conquistaId", "desbloqueadaEm", "id", "userId") SELECT "conquistaId", "desbloqueadaEm", "id", "userId" FROM "UsuarioConquista";
DROP TABLE "UsuarioConquista";
ALTER TABLE "new_UsuarioConquista" RENAME TO "UsuarioConquista";
CREATE UNIQUE INDEX "UsuarioConquista_userId_conquistaId_key" ON "UsuarioConquista"("userId", "conquistaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Curso_slug_key" ON "Curso"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_userId_cursoId_key" ON "Matricula"("userId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoAula_userId_aulaId_key" ON "ProgressoAula"("userId", "aulaId");
