const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) throw err;
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403); 
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };

exports.getAllNoticias = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Noticias', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Noticias');
        throw err;
      }
      res.json(result);
    });
  }];


  exports.addNoticia = [authenticateJWT, (req, res) => {
    const { descripcion, fecha } = req.body;
  
    if (!descripcion || !fecha) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    const newNoticia = { descripcion, fecha };
  
    db.query('INSERT INTO Noticias SET ?', newNoticia, (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar la noticia');
        throw err;
      }
      res.status(201).send('Noticia agregada correctamente');
    });
  }];

  exports.updateNoticias = [authenticateJWT, (req, res) => {
    const idNoticia = req.params.id;
    const { descripcion, fecha } = req.body;
  
    if (!descripcion && !fecha) {
      return res.status(400).send('Debe proporcionar al menos un campo para actualizar');
    }
  
    const updatedNoticia = {};
    if (descripcion) updatedNoticia.descripcion = descripcion;
    if (fecha) updatedNoticia.fecha = fecha;
  
    db.query('UPDATE Noticias SET ? WHERE idNoticia = ?', [updatedNoticia, idNoticia], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar la noticia');
        throw err;
      }
      res.send('Noticia actualizada correctamente');
    });
  }];

  exports.deleteNoticias = [authenticateJWT, (req, res) => {
    const idNoticia = req.params.id;
  
    db.query('DELETE FROM Noticias WHERE idNoticia = ?', idNoticia, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar la noticia');
        throw err;
      }
      res.send('Noticia eliminada correctamente');
    });
  }];
  