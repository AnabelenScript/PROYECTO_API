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

exports.getAllCitas = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Citas', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Citas');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addCita = [authenticateJWT, (req, res) => {
    const { tipo, fecha, horario } = req.body;
  
    if (!tipo || !fecha || !horario) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    const newCita = { tipo, fecha, horario };
  
    db.query('INSERT INTO Citas SET ?', newCita, (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar la cita');
        throw err;
      }
      res.status(201).send('Cita reportada correctamente');
    });
  }];

  exports.updateCita = [authenticateJWT, (req, res) => {
    const idCita = req.params.id;
    const { tipo, fecha, horario } = req.body;
    const updatedCita = { tipo, fecha, horario };
  
    db.query('UPDATE Citas SET ? WHERE idCita = ?', [updatedCita, idCita], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar la cita');
        throw err;
      }
      res.send('Cita actualizada correctamente');
    });
  }];

  exports.deleteCita = [authenticateJWT, (req, res) => {
    const idCita = req.params.id;
    db.query('DELETE FROM Citas WHERE idCita = ?', idCita, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar la cita');
        throw err;
      }
      res.send('Cita eliminada correctamente');
    });
  }];
  