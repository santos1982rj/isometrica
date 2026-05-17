#!/bin/sh
echo "Executando migrations..."
npx prisma migrate deploy
echo "Iniciando servidor..."
node dist/index.js