/**
 * @file seed-usuario.ts
 * @description Cria ou atualiza o usuário administrador.
 * 
 * Executar com: npx tsx prisma/seed-usuario.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});

const prisma = new PrismaClient({ adapter });

async function seedUsuario(): Promise<void> {
  console.log('👤 Criando/atualizando usuário...\n');

  const email = 'viniciussantosni@gmail.com';
  const senha = '123456';
  const senhaHash = await bcrypt.hash(senha, 10);

  const existe = await prisma.user.findUnique({ where: { email } });

  if (existe) {
    await prisma.user.update({
      where: { email },
      data: { senha: senhaHash, role: 'ADMIN' },
    });

    console.log('✅ Usuário atualizado:');
    console.log(`   Nome: ${existe.nome}`);
    console.log(`   Email: ${existe.email}`);
    console.log('   Senha: 123456');
    console.log('   Role: ADMIN');
  } else {
    await prisma.user.create({
      data: {
        nome: 'Vinicius Santos',
        email,
        senha: senhaHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Usuário criado:');
    console.log('   Nome: Vinicius Santos');
    console.log('   Email: viniciussantosni@gmail.com');
    console.log('   Senha: 123456');
    console.log('   Role: ADMIN');
  }

  console.log('\n🎉 Pronto! Faça login com:');
  console.log('   Email: viniciussantosni@gmail.com');
  console.log('   Senha: 123456');

  process.exit(0);
}

seedUsuario().catch((e: Error) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});