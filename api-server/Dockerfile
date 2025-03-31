# Use uma imagem oficial do Node.js como base
FROM node:14

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json para o container
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código para o container
COPY . .

# Expõe a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]
