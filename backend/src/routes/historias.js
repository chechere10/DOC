const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las historias
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, clienteId } = req.query;
    let where = {};

    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }

    if (search) {
      where.OR = [
        { observaciones: { contains: search } },
        { cliente: { nombre: { contains: search } } },
        { cliente: { cedula: { contains: search } } }
      ];
    }

    const historias = await prisma.historia.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: {
          select: { id: true, nombre: true, cedula: true, telefono: true, direccion: true }
        }
      }
    });

    res.json(historias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historias' });
  }
});

// Obtener una historia por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const historia = await prisma.historia.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true
      }
    });

    if (!historia) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historia' });
  }
});

// Crear historia
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clienteId, observaciones, valor, fecha } = req.body;

    if (!clienteId || !observaciones) {
      return res.status(400).json({ error: 'Cliente y observaciones son requeridos' });
    }

    const historia = await prisma.historia.create({
      data: {
        clienteId: parseInt(clienteId),
        observaciones,
        valor: valor ? parseFloat(valor) : null,
        fecha: fecha ? new Date(fecha) : new Date()
      },
      include: {
        cliente: true
      }
    });

    res.status(201).json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear historia' });
  }
});

// Actualizar historia
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones, valor, fecha } = req.body;

    const historia = await prisma.historia.update({
      where: { id: parseInt(id) },
      data: {
        observaciones,
        valor: valor ? parseFloat(valor) : null,
        fecha: fecha ? new Date(fecha) : undefined
      },
      include: {
        cliente: true
      }
    });

    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar historia' });
  }
});

// Eliminar historia
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.historia.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Historia eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar historia' });
  }
});

module.exports = router;
