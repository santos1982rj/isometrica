#!/bin/sh
echo "Executando migrations..."
npx prisma migrate deploy
echo "Iniciando servidor..."
exec node dist/index.js