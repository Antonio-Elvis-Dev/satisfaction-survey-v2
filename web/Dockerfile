# Build da aplicação
FROM node:20
WORKDIR /web

COPY package*.json ./

RUN npm install
COPY . .

# Servir com Nginx

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

