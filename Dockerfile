FROM node:22-alpine

WORKDIR /app

# Les dépendances sont installées avant la copie du code
# pour profiter du cache Docker.
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
