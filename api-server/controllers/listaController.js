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


// Atualizar nome da lista
exports.updateLista = async (req, res) => {
  const { nome } = req.body;
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    lista.nome = nome || lista.nome;
    lista = await lista.save();
    req.io.to(`user_${req.user.id}`).emit('lista_atualizada', lista);
    res.json(lista);
  } catch (err) {
    res.status(500).send('Erro no servidor ao atualizar lista');
  }
};
