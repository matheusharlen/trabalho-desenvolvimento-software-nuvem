const mongoose = require('mongoose');
const Lista = require('../models/Lista');

// Buscar todas as listas do usuário
exports.getListas = async (req, res) => {
  try {
    const listas = await Lista.find({ usuarioId: req.user.id });
    res.json(listas);
  } catch (err) {
    res.status(500).send('Erro no servidor ao obter listas (api)');
  }
};


// Criar uma nova lista
exports.createLista = async (req, res) => {
  const { nome } = req.body;
  try {
    const newLista = new Lista({
      nome,
      usuarioId: req.user.id,
      itens: [],
      categorias: [],
    });
    const lista = await newLista.save();
    req.io.to(`user_${req.user.id}`).emit('lista_nova', lista);
    res.json(lista);
  } catch (err) {
    res.status(500).send('Erro no servidor ao criar lista');
  }
};