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



// Deleta a lista e todos os itens dentro dela
exports.deleteLista = async (req, res) => {
    try {
      let lista = await Lista.findById(req.params.id);
      if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
      if (lista.usuarioId.toString() !== req.user.id.toString()) {
        return res.status(401).json({ msg: 'Não autorizado' });
      }
      await Lista.findByIdAndDelete(req.params.id);
      req.io.to(`user_${req.user.id}`).emit('lista_removida', { id: req.params.id });
      res.json({ msg: 'Lista removida com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar lista:', err);
      res.status(500).send('Erro  ao deletar a lista no servidor (api)');
    }
  };


  // Buscar lista por ID
  exports.getListaById = async (req, res) => {
    try {
      const lista = await Lista.findById(req.params.id);
      if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
      if (lista.usuarioId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Não autorizado' });
      }
      res.json(lista);
    } catch (err) {
      res.status(500).send('Erro no servidor ao obter lista (api)');
    }
  };
  


// Adicionar item sem categoria
exports.addItem = async (req, res) => {
  const { nome, quantidade, preco, checked } = req.body;
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    if (!nome) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório' });
    }
    const total = quantidade * preco;
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      nome,
      quantidade,
      preco,
      total,
      checked,
    };
    lista.itens.push(newItem);
    await lista.save();
    req.io.to(`lista_${lista._id}`).emit('item_adicionado', newItem);
    res.json(newItem);
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
    res.status(500).send('Erro no servidor ao adicionar item (api)');
  }
};


// Atualizar item sem categoria
exports.updateItem = async (req, res) => {
  const { nome, quantidade, preco, checked } = req.body;
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const item = lista.itens.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado' });

    item.nome = nome !== undefined ? nome : item.nome;
    item.quantidade = quantidade !== undefined ? quantidade : item.quantidade;
    item.preco = preco !== undefined ? preco : item.preco;
    item.total = item.quantidade * item.preco;
    item.checked = checked !== undefined ? checked : item.checked;

    await lista.save();
    req.io.to(`lista_${lista._id}`).emit('item_atualizado', item);
    res.json(item);
  } catch (err) {
    res.status(500).send('Erro no servidor ao atualizar item da lista (api)');
  }
};


// Deletar item sem categoria
exports.deleteItem = async (req, res) => {
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const item = lista.itens.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado' });

    lista.itens.pull(item);
    await lista.save();
    req.io.to(`lista_${lista._id}`).emit('item_removido', { itemId: req.params.itemId });
    res.json({ msg: 'Item removido com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar item:', err);
    res.status(500).send('Erro no servidor');
  }
};

// Adicionar categoria
exports.addCategory = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório' });
    }
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    const novaCategoria = {
      _id: new mongoose.Types.ObjectId(),
      nome,
      itens: [],
    };
    lista.categorias.push(novaCategoria);
    await lista.save();
    res.json(novaCategoria);
  } catch (err) {
    console.error('Erro ao adicionar categoria:', err);
    res.status(500).send('Erro no servidor ao adicionar categoria (api)');
  }
};



// Adicionar item dentro de uma categoria
exports.addItemToCategory = async (req, res) => {
  try {
    const { nome, quantidade, preco, checked } = req.body;
    if (!nome) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório' });
    }
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    const categoria = lista.categorias.id(req.params.catId);
    if (!categoria) return res.status(404).json({ msg: 'Categoria não encontrada' });

    const total = quantidade * preco;
    const novoItem = {
      _id: new mongoose.Types.ObjectId(),
      nome,
      quantidade,
      preco,
      total,
      checked,
    };
    categoria.itens.push(novoItem);
    await lista.save();
    res.json(novoItem);
  } catch (err) {
    console.error('Erro ao adicionar item na categoria:', err);
    res.status(500).send('Erro no servidor ao adicionar item na categoria (api)');
  }
};


// Atualizar item dentro de uma categoria
exports.updateItemInCategory = async (req, res) => {
  const { nome, quantidade, preco, checked } = req.body;
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const categoria = lista.categorias.id(req.params.catId);
    if (!categoria) return res.status(404).json({ msg: 'Categoria não encontrada' });

    const item = categoria.itens.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado na categoria' });

    item.nome = nome !== undefined ? nome : item.nome;
    item.quantidade = quantidade !== undefined ? quantidade : item.quantidade;
    item.preco = preco !== undefined ? preco : item.preco;
    item.total = item.quantidade * item.preco;
    item.checked = checked !== undefined ? checked : item.checked;

    await lista.save();
    res.json(item);
  } catch (err) {
    res.status(500).send('Erro no servidor ao atualizar item na categoria (api)');
  }
};

// Deletar item dentro de uma categoria
exports.deleteItemInCategory = async (req, res) => {
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const categoria = lista.categorias.id(req.params.catId);
    if (!categoria) return res.status(404).json({ msg: 'Categoria não encontrada' });

    const item = categoria.itens.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado na categoria' });

    categoria.itens.pull(item);
    await lista.save();

    res.json({ msg: 'Item da categoria removido com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar item da categoria:', err);
    res.status(500).send('Erro no servidor');
  }
};

// Atualizar nome da categoria
exports.updateCategory = async (req, res) => {
  try {
    let lista = await Lista.findById(req.params.id);
    if (!lista) return res.status(404).json({ msg: 'Lista não encontrada' });
    if (lista.usuarioId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const categoria = lista.categorias.id(req.params.catId);
    if (!categoria) return res.status(404).json({ msg: 'Categoria não encontrada' });

    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório para renomear a categoria' });
    }

    categoria.nome = nome;
    await lista.save();

    res.json(categoria);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    res.status(500).send('Erro no servidor ao atualizar categoria');
  }
};
