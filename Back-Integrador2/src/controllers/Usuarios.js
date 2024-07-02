const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conexión a la BD establecida');
});

exports.login = async (req, res) => {
  const { idUsuario, password } = req.body;

  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], async (err, result) => {
    if (err) {
      res.status(500).send('Error en el servidor');
      throw err;
    }
    if (result.length === 0) {
      return res.status(401).send('Credenciales inválidas');
    }
    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Credenciales inválidas');
    }
    const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
      "mensaje": "Bienvenido",
      token });
  });
};

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
exports.getAllUsers = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Usuarios', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener los usuarios');
      throw err;
    }
    res.json(result);
  });
}];

exports.register = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  const { edad, nombre, fechaNacimiento, domicilio, numTelefono, estadoCivil } = req.body;

  if (!edad || !nombre || !fechaNacimiento || !domicilio || !numTelefono || !estadoCivil) {
    return res.status(400).send('Data register is required');
  }

  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error en el servidor');
      throw err;
    }
    if (result.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }

    db.query('UPDATE Usuarios SET edad = ?, nombre = ?, fechaNacimiento = ?, domicilio = ?, numTelefono = ?, estadoCivil = ? WHERE idUsuario = ?', 
      [edad, nombre, fechaNacimiento, domicilio, numTelefono, estadoCivil, idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al registrar los datos');
        throw err;
      }
      res.send('Datos registrados correctamente');
    });
  });
}];

exports.addUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error hashing password');
    }

    const newUser = { email, password: hash };

      db.query('INSERT INTO Usuarios (email, password) VALUES (?, ?)', [newUser.email, newUser.password], (err, result) => {
        if (err) {
          console.error('Error executing insert query:', err);
          return res.status(500).send('Error adding user');
        }
        console.log(`Registro exitoso. Este es tu ID de usuario para iniciar sesión`);
        
        res.status(201).send('User added successfully');
      });
    })
  }

  exports.updateUser = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const { edad, nombre, fechaNacimiento, domicilio, numTelefono, email, estadoCivil, password } = req.body;
    const fieldsToUpdate = {};
    if (edad) fieldsToUpdate.edad = edad;
    if (nombre) fieldsToUpdate.nombre = nombre;
    if (fechaNacimiento) fieldsToUpdate.fechaNacimiento = fechaNacimiento;
    if (domicilio) fieldsToUpdate.domicilio = domicilio;
    if (numTelefono) fieldsToUpdate.numTelefono = numTelefono;
    if (email) fieldsToUpdate.email = email;
    if (estadoCivil) fieldsToUpdate.estadoCivil = estadoCivil;
    if (password) fieldsToUpdate.password = password;
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).send('No hay campos para actualizar');
    }   
  
    db.query('UPDATE Usuarios SET ? WHERE idUsuario = ?', [fieldsToUpdate, idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar el elemento');
        throw err;
      }
      res.send('Elemento actualizado correctamente');
    });
  }];
  

exports.deleteUser = [authenticateJWT,(req, res) => {
  const idUsuario = req.params.id;
  db.query('DELETE FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar el elemento');
      throw err;
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.send('Elemento eliminado correctamente');
  });
}];
