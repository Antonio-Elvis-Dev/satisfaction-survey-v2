# Optei por node:20 (sem ser alpine) para evitar problemas com OpenSSL do Prisma, 
# mas se preferires o alpine, terás de instalar o openssl manualmente.
FROM node:20

WORKDIR /usr/src/app

# Copia dependências primeiro (para aproveitar o cache do Docker)
COPY package*.json ./

RUN npm install

# Copia o código fonte
COPY . .

# Gera o cliente do Prisma (isso pode ser feito no build, pois gera apenas arquivos JS/TS)
RUN npx prisma generate

# Removemos o migrate daqui! ❌

EXPOSE 3333

# O "Pulo do Gato" 🐈
# Usamos 'sh -c' para rodar dois comandos em sequência:
# 1. Aplica as migrações pendentes no banco (npx prisma migrate deploy)
# 2. Inicia o servidor (npm run start:dev)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]