const mongoose = require('mongoose');

// Subdocumento para itens 
const ItemSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, default: 1 },
  preco: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  checked: { type: Boolean, default: false },
});

// Subdocumento para categorias
const CategoriaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  itens: [ItemSchema], // cada categoria possui seus itens
});

// Modelo principal de Lista
const ListaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Itens sem categoria (continua igual)
  itens: [ItemSchema],

  // Array de categorias (cada categoria contém seus itens)
  categorias: [CategoriaSchema],
});

module.exports = mongoose.model('Lista', ListaSchema);
