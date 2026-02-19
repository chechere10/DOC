const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ============ AUTH MIDDLEWARE ============
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token mal formateado' });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Token mal formateado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
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
      data: { usuario, password: hashedPassword, nombre }
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await prisma.usuario.findUnique({ where: { usuario } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

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

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, usuario: true, nombre: true }
    });

    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    res.json({ usuario: user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.get('/api/auth/usuarios', async (req, res) => {
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

app.get('/api/auth/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, usuario: true, nombre: true }
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

app.put('/api/auth/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, nombre } = req.body;

    if (usuario) {
      const existingUser = await prisma.usuario.findFirst({
        where: { usuario, NOT: { id: parseInt(id) } }
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

app.put('/api/auth/usuarios/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordNueva) {
      return res.status(400).json({ error: 'La nueva contraseña es requerida' });
    }

    const user = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

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

app.delete('/api/auth/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

// ============ CLIENTES ROUTES ============
app.get('/api/clientes', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};

    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { cedula: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { historias: true, formulas: true } }
      }
    });
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.get('/api/clientes/:id', authMiddleware, async (req, res) => {
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

    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

app.post('/api/clientes', authMiddleware, upload.single('foto'), async (req, res) => {
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
        foto: null
      }
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

app.put('/api/clientes/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, direccion } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { nombre, cedula, telefono, direccion }
    });

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

app.delete('/api/clientes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// ============ HISTORIAS ROUTES ============
app.get('/api/historias', authMiddleware, async (req, res) => {
  try {
    const { search, clienteId } = req.query;
    let where = {};

    if (clienteId) where.clienteId = parseInt(clienteId);

    if (search) {
      where.OR = [
        { observaciones: { contains: search, mode: 'insensitive' } },
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        { cliente: { cedula: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const historias = await prisma.historia.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: {
          select: { id: true, nombre: true, cedula: true, telefono: true, direccion: true }
        },
        examenes: true
      }
    });

    res.json(historias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historias' });
  }
});

app.get('/api/historias/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const historia = await prisma.historia.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, examenes: true }
    });

    if (!historia) return res.status(404).json({ error: 'Historia no encontrada' });
    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historia' });
  }
});

app.post('/api/historias', authMiddleware, async (req, res) => {
  try {
    const { clienteId, observaciones, valor, fecha, tipoPago, referido } = req.body;

    if (!clienteId || !observaciones) {
      return res.status(400).json({ error: 'Cliente y observaciones son requeridos' });
    }

    const historia = await prisma.historia.create({
      data: {
        clienteId: parseInt(clienteId),
        observaciones,
        valor: valor ? parseFloat(valor) : null,
        tipoPago: tipoPago || 'pago',
        referido: referido || null,
        fecha: fecha ? new Date(fecha) : new Date()
      },
      include: { cliente: true, examenes: true }
    });

    // Si se envían exámenes (base64), guardarlos
    if (req.body.examenes && req.body.examenes.length > 0) {
      for (const examen of req.body.examenes) {
        await prisma.examen.create({
          data: {
            nombre: examen.nombre || 'Examen',
            imagen: examen.imagen,
            historiaId: historia.id
          }
        });
      }
      // Re-fetch con exámenes
      const historiaConExamenes = await prisma.historia.findUnique({
        where: { id: historia.id },
        include: { cliente: true, examenes: true }
      });
      return res.status(201).json(historiaConExamenes);
    }

    res.status(201).json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear historia' });
  }
});

app.put('/api/historias/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones, valor, fecha, tipoPago, referido } = req.body;

    const historia = await prisma.historia.update({
      where: { id: parseInt(id) },
      data: {
        observaciones,
        valor: valor ? parseFloat(valor) : null,
        tipoPago: tipoPago || 'pago',
        referido: referido || null,
        fecha: fecha ? new Date(fecha) : undefined
      },
      include: { cliente: true, examenes: true }
    });

    // Si se envían exámenes nuevos, agregarlos
    if (req.body.examenes && req.body.examenes.length > 0) {
      for (const examen of req.body.examenes) {
        if (!examen.id) { // Solo crear los nuevos (sin id)
          await prisma.examen.create({
            data: {
              nombre: examen.nombre || 'Examen',
              imagen: examen.imagen,
              historiaId: historia.id
            }
          });
        }
      }
      const historiaActualizada = await prisma.historia.findUnique({
        where: { id: historia.id },
        include: { cliente: true, examenes: true }
      });
      return res.json(historiaActualizada);
    }

    res.json(historia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar historia' });
  }
});

app.delete('/api/historias/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.historia.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Historia eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar historia' });
  }
});

// ============ EXAMENES ROUTES ============
app.delete('/api/examenes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.examen.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Examen eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar examen' });
  }
});

// ============ FORMULAS ROUTES ============
app.get('/api/formulas', authMiddleware, async (req, res) => {
  try {
    const { search, clienteId } = req.query;
    let where = {};

    if (clienteId) where.clienteId = parseInt(clienteId);

    if (search) {
      where.OR = [
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        { cliente: { cedula: { contains: search, mode: 'insensitive' } } }
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

app.get('/api/formulas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const formula = await prisma.formula.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, items: true }
    });

    if (!formula) return res.status(404).json({ error: 'Fórmula no encontrada' });
    res.json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener fórmula' });
  }
});

app.post('/api/formulas', authMiddleware, async (req, res) => {
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
            cantidad: parseInt(item.cantidad),
            unidad: item.unidad || 'FRASCOS'
          }))
        }
      },
      include: { cliente: true, items: true }
    });

    res.status(201).json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear fórmula' });
  }
});

app.put('/api/formulas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, fecha } = req.body;

    await prisma.formulaItem.deleteMany({ where: { formulaId: parseInt(id) } });

    const formula = await prisma.formula.update({
      where: { id: parseInt(id) },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        items: {
          create: items.map(item => ({
            nombre: item.nombre,
            cantidad: parseInt(item.cantidad),
            unidad: item.unidad || 'FRASCOS'
          }))
        }
      },
      include: { cliente: true, items: true }
    });

    res.json(formula);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar fórmula' });
  }
});

app.delete('/api/formulas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.formula.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Fórmula eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar fórmula' });
  }
});

// ============ NOTAS ROUTES ============
app.get('/api/notas', authMiddleware, async (req, res) => {
  try {
    const { estado, search } = req.query;
    let where = {};

    if (estado) where.estado = estado;
    if (search) where.contenido = { contains: search, mode: 'insensitive' };

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

app.get('/api/notas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await prisma.nota.findUnique({ where: { id: parseInt(id) } });

    if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
    res.json(nota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener nota' });
  }
});

app.post('/api/notas', authMiddleware, async (req, res) => {
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

app.put('/api/notas/:id', authMiddleware, async (req, res) => {
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

app.patch('/api/notas/:id/estado', authMiddleware, async (req, res) => {
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

app.delete('/api/notas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.nota.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar nota' });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema Médico FUNDAMUFA - API funcionando' });
});

module.exports = app;
