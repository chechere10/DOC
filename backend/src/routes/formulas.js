const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las fórmulas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, clienteId } = req.query;
    let where = {};

    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }

    if (search) {
      where.OR = [
        { cliente: { nombre: { contains: search } } },
        { cliente: { cedula: { contains: search } } }
      ];
    }

    const formulas = await prisma.formula.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: {
          select: { id: true, nombre: true, cedula: true, telefono: true, direccion: true }
        },
        items: true
      }
    });

    res.json(formulas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener fórmulas' });
  }
});

// Obtener una fórmula por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const formula = await prisma.formula.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        items: true
      }
    });

    if (!formula) {
      return res.status(404).json({ error: 'Fórmula no encontrada' });
    }

    res.json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener fórmula' });
  }
});

// Crear fórmula
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clienteId, items, fecha } = req.body;

    if (!clienteId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Cliente e items son requeridos' });
    }

    const formula = await prisma.formula.create({
      data: {
        clienteId: parseInt(clienteId),
        fecha: fecha ? new Date(fecha) : new Date(),
        items: {
          create: items.map(item => ({
            nombre: item.nombre,
            cantidad: parseInt(item.cantidad)
          }))
        }
      },
      include: {
        cliente: true,
        items: true
      }
    });

    res.status(201).json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear fórmula' });
  }
});

// Actualizar fórmula
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, fecha } = req.body;

    // Eliminar items anteriores
    await prisma.formulaItem.deleteMany({
      where: { formulaId: parseInt(id) }
    });

    // Actualizar fórmula con nuevos items
    const formula = await prisma.formula.update({
      where: { id: parseInt(id) },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        items: {
          create: items.map(item => ({
            nombre: item.nombre,
            cantidad: parseInt(item.cantidad)
          }))
        }
      },
      include: {
        cliente: true,
        items: true
      }
    });

    res.json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar fórmula' });
  }
});

// Eliminar fórmula
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.formula.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Fórmula eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar fórmula' });
  }
});

module.exports = router;
