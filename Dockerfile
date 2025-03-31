# Use uma imagem oficial do Node.js como base
FROM node:14

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json da pasta api-server para o container
COPY api-server/package*.json ./ 

# Instala as dependências do projeto
RUN npm install

# Copia todo o código da pasta api-server para o container
COPY api-server/ .

# Expõe a porta utilizada na aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]
