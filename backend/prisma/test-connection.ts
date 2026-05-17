/// <reference types="node" />

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});

const prisma = new PrismaClient({ adapter });

async function testar(): Promise<void> {
  console.log('🔌 Testando conexão...');

  // Testa contagem de usuários
  const usuarios = await prisma.user.count();
  console.log(`📊 Usuários no banco: ${usuarios}`);

  // Testa criar um curso simples
  console.log('📝 Tentando criar curso de teste...');
  
  const curso = await prisma.curso.create({
    data: {
      titulo: 'Curso Teste',
      slug: 'curso-teste-' + Date.now(),
      descricao: 'Descrição teste',
    }
  });

  console.log(`✅ Curso criado com ID: ${curso.id}`);
  console.log(`📝 Título: ${curso.titulo}`);

  // Verifica se aparece na listagem
  const totalCursos = await prisma.curso.count();
  console.log(`📊 Total de cursos no banco: ${totalCursos}`);

  // Limpa o teste
  await prisma.curso.delete({ where: { id: curso.id } });
  console.log('🧹 Curso de teste removido');

  process.exit(0);
}

testar().catch((e: Error) => {
  console.error('❌ ERRO:', e.message);
  console.error('Detalhes:', e);
  process.exit(1);
});