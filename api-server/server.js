require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar rotas
const userRoutes = require('./routes/users');
const listaRoutes = require('./routes/listas');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Configurar o servidor HTTP e o Socket.IO
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

// Configurar o Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Cliente entrou na sala: ${room}`);
  });

  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`Cliente saiu da sala: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Middleware para adicionar o Socket.IO ao request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Usar rotas
app.use('/users', userRoutes);
app.use('/listas', listaRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('API funcionando com Socket.IO');
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
