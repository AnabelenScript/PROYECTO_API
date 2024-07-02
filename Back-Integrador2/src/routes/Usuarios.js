const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/Usuarios');
const { register } = require('../controllers/Usuarios');

router.get('/', usuariosController.getAllUsers);
router.put('/:id', usuariosController.updateUser);
router.delete('/:id', usuariosController.deleteUser);
router.get('/login', usuariosController.login);
router.post('/addUser', usuariosController.addUser);
router.post('/:id', usuariosController.register)

module.exports = router;


