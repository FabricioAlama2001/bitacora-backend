# Etapa única para backend Node
FROM node:20-alpine

WORKDIR /app

# Copiamos package files primero para aprovechar cache
COPY package*.json ./

RUN npm install

# Copiamos el resto del proyecto
COPY . .

EXPOSE 3000

CMD ["npm", "start"]