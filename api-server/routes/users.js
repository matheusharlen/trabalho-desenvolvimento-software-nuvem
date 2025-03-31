const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Rotas do usuário (Registro, Login, Perfil, Atualizar nome, Atualizar Senha e Deletar Conta)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', auth, userController.getUserProfile);
router.put('/update-name', auth, userController.updateUserName);
router.put('/update-password', auth, userController.updateUserPassword);
router.delete('/delete-account', auth, userController.deleteUserAccount);

module.exports = router;
