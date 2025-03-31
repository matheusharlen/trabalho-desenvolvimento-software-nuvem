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

// Login de usuário
exports.loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifica o usuário
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

    // Verifica a senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });

    // Retorna o JWT
    const payload = { user: { id: user.id, nome: user.nome } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Erro ao fazer login no servidor');
  }
};

// Busca o perfil do usuário
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    if(!user){
      return res.status(404).json({ msg: 'Usuário não encontrado'});
    }
    res.json(user);
  } catch (err) {
    console.error('Erro ao obeter o perfil do usuário');
    res.status(500).send('Erro ao obter nome usuário no servidor');
  }
};
// Atualiza o nome do usuário
exports.updateUserName = async (req, res) => {
  const { nome } = req.body;
  try {
    if (!nome) {
      return res.status(400).json({ msg: 'O campo "nome" é obrigatório' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nome },
      { new: true, select: '-senha' }
    );

    res.json(user);
  } catch (err) {
    console.error('Erro ao atualizar nome do usuário:', err);
    res.status(500).send('Erro ao atualizar o nome do usuário no servidor');
  }
};

// Atualiza Senha do Usuário
exports.updateUserPassword = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  try {
    // Verifica se os campos foram fornecidos
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ msg: 'Por favor, preencha todos os campos' });
    }

    // Obtem o usuário do banco de dados
    const user = await User.findById(req.user.id);

    // Verifica se o usuário existe
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Verifica se a senha atual está correta
    const isMatch = await bcrypt.compare(senhaAtual, user.senha);
    if (!isMatch) {
      return res.status(400).json({ msg: 'A senha atual está incorreta' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.senha = await bcrypt.hash(novaSenha, salt);

    // Salvar a nova senha
    await user.save();

    res.json({ msg: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar senha do usuário:', err);
    res.status(500).send('Erro ao atualizar a senha no servidor');
  }
};
