FROM node:20.19.6-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (inclure prisma en production ou le laisser en dev mais l'installer)
RUN npm ci --omit=dev

# IMPORTANT : installer prisma (même si en dev) pour pouvoir générer le client
RUN npm install prisma

# Copier tout le code
COPY . .

# Générer le client Prisma (maintenant en tant que root)
RUN npx prisma generate

# Changer pour l'utilisateur node
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]