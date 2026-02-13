const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      usuario: 'admin',
      password: hashedPassword,
      nombre: 'Administrador'
    }
  });

  console.log('✅ Usuario admin creado:', admin.usuario);

  const jorgePassword = await bcrypt.hash('jorge123', 10);
  
  const jorge = await prisma.usuario.upsert({
    where: { usuario: 'jorge' },
    update: {},
    create: {
      usuario: 'jorge',
      password: jorgePassword,
      nombre: 'Jorge'
    }
  });

  console.log('✅ Usuario jorge creado:', jorge.usuario);

  const cliente1 = await prisma.cliente.upsert({
    where: { cedula: '12345678' },
    update: {},
    create: {
      nombre: 'Juan Pérez García',
      cedula: '12345678',
      telefono: '3001234567',
      direccion: 'Calle 50 # 45-30, Medellín'
    }
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { cedula: '87654321' },
    update: {},
    create: {
      nombre: 'María López Rodríguez',
      cedula: '87654321',
      telefono: '3109876543',
      direccion: 'Carrera 70 # 32-15, Medellín'
    }
  });

  console.log('✅ Clientes de ejemplo creados');

  // Verificar si ya existen historias para no duplicar
  const historiasCount = await prisma.historia.count({ where: { clienteId: cliente1.id } });
  if (historiasCount === 0) {
    await prisma.historia.create({
      data: {
        clienteId: cliente1.id,
        observaciones: 'Paciente acude a consulta por dolor de cabeza recurrente. Se recomienda tomar abundante agua y descanso.',
        valor: 50000
      }
    });
    console.log('✅ Historia de ejemplo creada');
  }

  const formulasCount = await prisma.formula.count({ where: { clienteId: cliente1.id } });
  if (formulasCount === 0) {
    await prisma.formula.create({
      data: {
        clienteId: cliente1.id,
        items: {
          create: [
            { nombre: 'Acetaminofén 500mg', cantidad: 20 },
            { nombre: 'Ibuprofeno 400mg', cantidad: 10 }
          ]
        }
      }
    });
    console.log('✅ Fórmula de ejemplo creada');
  }

  const notasCount = await prisma.nota.count();
  if (notasCount === 0) {
    await prisma.nota.create({
      data: {
        contenido: 'Llamar a Juan Pérez para recordar cita de control',
        fecha: new Date(),
        hora: '10:00',
        estado: 'abierta'
      }
    });

    await prisma.nota.create({
      data: {
        contenido: 'Revisar resultados de laboratorio de María López',
        fecha: new Date(),
        hora: '14:30',
        estado: 'abierta'
      }
    });
    console.log('✅ Notas de ejemplo creadas');
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
