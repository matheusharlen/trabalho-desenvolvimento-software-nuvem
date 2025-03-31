const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listaController');
const auth = require('../middlewares/auth');

// Listas
router.get('/', auth, listaController.getListas);
router.post('/', auth, listaController.createLista);
router.get('/:id', auth, listaController.getListaById);
router.put('/:id', auth, listaController.updateLista);
router.delete('/:id', auth, listaController.deleteLista);

// Itens SEM categoria
router.post('/:id/itens', auth, listaController.addItem);
router.put('/:id/itens/:itemId', auth, listaController.updateItem);
router.delete('/:id/itens/:itemId', auth, listaController.deleteItem);

// Categorias
router.post('/:id/categorias', auth, listaController.addCategory);
router.put('/:id/categorias/:catId', auth, listaController.updateCategory);
router.delete('/:id/categorias/:catId', auth, listaController.deleteCategory);

// Itens DENTRO de uma categoria
router.post('/:id/categorias/:catId/itens', auth, listaController.addItemToCategory);
router.put('/:id/categorias/:catId/itens/:itemId', auth, listaController.updateItemInCategory);
router.delete('/:id/categorias/:catId/itens/:itemId', auth, listaController.deleteItemInCategory);
module.exports = router;