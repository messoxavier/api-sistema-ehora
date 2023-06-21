const express = require('express');
const router = express.Router();
const login = require('../middleware/login')
const ConsultaController = require('../controllers/controllerConsultas');

//////////////////////////
// Rota salva Consulta //
////////////////////////
router.post('/', ConsultaController.inserirConsultas);
//////////////////////////////////////
// Rota Retrona todas as consultas //
////////////////////////////////////
router.get('/', ConsultaController.getconsultas);
/////////////////////////////////////
// Rota Retrona consulta por data //
////////////////////////////////////
router.post('/pordata', login, ConsultaController.getconsultasdatas);
////////////////////////////////////////
// Rota Retrona consulta por usuario //
////////////////////////////////////// 
router.post('/porusuario', login, ConsultaController.getconsultasusuario);

router.post('/horariodisponiveis', login, ConsultaController.getconsultahorarios);






module.exports = router;