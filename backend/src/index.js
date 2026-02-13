require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const historiasRoutes = require('./routes/historias');
const formulasRoutes = require('./routes/formulas');
const notasRoutes = require('./routes/notas');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/formulas', formulasRoutes);
app.use('/api/notas', notasRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema Médico FUNDAMUFA - API funcionando' });
});

app.listen(PORT, () => {
  console.log(`🏥 Servidor corriendo en http://localhost:${PORT}`);
});
