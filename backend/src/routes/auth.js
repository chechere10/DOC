const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { usuario, password, nombre } = req.body;

    if (!usuario || !password || !nombre) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        usuario,
        password: hashedPassword,
        nombre
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      usuario: { id: user.id, usuario: user.usuario, nombre: user.nombre },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await prisma.usuario.findUnique({ where: { usuario } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      usuario: { id: user.id, usuario: user.usuario, nombre: user.nombre },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Verificar token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, usuario: true, nombre: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Listar todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, usuario: true, nombre: true, createdAt: true }
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID
router.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, usuario: true, nombre: true }
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Actualizar usuario (nombre y/o usuario de login)
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, nombre } = req.body;

    // Verificar si el nuevo nombre de usuario ya existe
    if (usuario) {
      const existingUser = await prisma.usuario.findFirst({
        where: { 
          usuario,
          NOT: { id: parseInt(id) }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { 
        ...(usuario && { usuario }),
        ...(nombre && { nombre })
      },
      select: { id: true, usuario: true, nombre: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Cambiar contraseña
router.put('/usuarios/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordNueva) {
      return res.status(400).json({ error: 'La nueva contraseña es requerida' });
    }

    const user = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual si se proporciona (para cambio propio)
    if (passwordActual) {
      const validPassword = await bcrypt.compare(passwordActual, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }
    }

    const hashedPassword = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar el último usuario
    const count = await prisma.usuario.count();
    if (count <= 1) {
      return res.status(400).json({ error: 'No se puede eliminar el único usuario del sistema' });
    }

    await prisma.usuario.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
