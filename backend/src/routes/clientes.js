const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configuración de multer para subir fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cliente-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Obtener todos los clientes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
    
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search } },
          { cedula: { contains: search } }
        ]
      };
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { historias: true, formulas: true }
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener un cliente por ID con sus historias y fórmulas
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        historias: { orderBy: { fecha: 'desc' } },
        formulas: { 
          orderBy: { fecha: 'desc' },
          include: { items: true }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// Crear cliente
router.post('/', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion } = req.body;

    if (!nombre || !cedula) {
      return res.status(400).json({ error: 'Nombre y cédula son requeridos' });
    }

    const existingCliente = await prisma.cliente.findUnique({ where: { cedula } });
    if (existingCliente) {
      return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        cedula,
        telefono: telefono || null,
        direccion: direccion || null,
        foto: req.file ? `/uploads/${req.file.filename}` : null
      }
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// Actualizar cliente
router.put('/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, direccion } = req.body;

    const data = { nombre, cedula, telefono, direccion };
    if (req.file) {
      data.foto = `/uploads/${req.file.filename}`;
    }

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
