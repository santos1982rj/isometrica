FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm install --legacy-peer-deps && npx prisma generate && npm run build
RUN npx prisma migrate deploy
EXPOSE 3001
CMD ["node", "dist/index.js"]