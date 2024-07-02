const express = require('express');
const router = express.Router();
const noticiasController = require('../controllers/noticias');


router.get('/getAllNoticias', noticiasController.getAllNoticias);
router.post('/addNoticia', noticiasController.addNoticia);
router.put('/updateNoticias', noticiasController.updateNoticias);
router.delete('/deleteNoticias', noticiasController.deleteNoticias);

module.exports = router;