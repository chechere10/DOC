const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las notas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado, search } = req.query;
    let where = {};

    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where.contenido = { contains: search };
    }

    const notas = await prisma.nota.findMany({
      where,
      orderBy: { fecha: 'desc' }
    });

    res.json(notas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

// Obtener una nota por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await prisma.nota.findUnique({
      where: { id: parseInt(id) }
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener nota' });
  }
});

// Crear nota
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contenido, fecha, hora } = req.body;

    if (!contenido) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const nota = await prisma.nota.create({
      data: {
        contenido,
        fecha: fecha ? new Date(fecha) : new Date(),
        hora: hora || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        estado: 'abierta'
      }
    });

    res.status(201).json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear nota' });
  }
});

// Actualizar nota
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido, fecha, hora, estado } = req.body;

    const nota = await prisma.nota.update({
      where: { id: parseInt(id) },
      data: {
        contenido,
        fecha: fecha ? new Date(fecha) : undefined,
        hora,
        estado
      }
    });

    res.json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar nota' });
  }
});

// Cambiar estado de nota (abrir/cerrar)
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['abierta', 'cerrada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const nota = await prisma.nota.update({
      where: { id: parseInt(id) },
      data: { estado }
    });

    res.json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar estado de nota' });
  }
});

// Eliminar nota
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.nota.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar nota' });
  }
});

module.exports = router;
