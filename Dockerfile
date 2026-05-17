FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm install --legacy-peer-deps && npx prisma generate && npm run build

# Copia o script de inicialização
COPY backend/start.sh ./
RUN chmod +x start.sh

EXPOSE 3001

CMD ["./start.sh"]