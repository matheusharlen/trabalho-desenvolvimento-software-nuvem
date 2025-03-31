const User = require('../models/User');
const Lista = require('../models/Lista');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar um novo usuário
exports.registerUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se o usuário já existe-
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Usuário já existe' });

    // Cria um novo usuário
    user = new User({ nome, email, senha });

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    user.senha = await bcrypt.hash(senha, salt);

    // Salva o usuário
    await user.save();

    // Retorna o JWT
    const payload = { user: { id: user.id, nome: user.nome } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Erro ao criar usuário no servidor');
  }
};