const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/controllerUsuarios');


router.post('/cadastro', UsuariosController.cadastroUsuario);

router.post('/login', UsuariosController.loginUsuario);

module.exports = router;