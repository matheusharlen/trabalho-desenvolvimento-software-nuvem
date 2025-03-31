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