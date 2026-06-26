FROM node:20-alpine AS base

WORKDIR /app

# Dépendances
COPY package.json ./
RUN npm install --omit=dev

# Prisma generate
COPY prisma ./prisma/
RUN npx prisma generate

# Code source
COPY . .

# Port exposé
EXPOSE 3001

# Script de démarrage : migrations + seed + serveur
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node index.js"]
