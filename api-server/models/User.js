const mongoose = require('mongoose');

// Cria o esquema de usuário no banco de dados
const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  
});

module.exports = mongoose.model('User', UserSchema);
