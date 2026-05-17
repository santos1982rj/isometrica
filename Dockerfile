FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm install --legacy-peer-deps && npx prisma generate && npm run build

# Adicione esta linha para rodar as migrations automaticamente
RUN npx prisma migrate deploy

EXPOSE 3001

RUN npx prisma migrate deploy


CMD ["node", "dist/index.js"]