import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inicializando base de datos...');

  // Verificar si ya existe la encuesta
  const existingPoll = await prisma.poll.findUnique({
    where: { id: 'poll_1' },
  });

  if (existingPoll) {
    console.log('✓ La encuesta poll_1 ya existe, saltando seed');
    return;
  }

  // Crear encuesta de ejemplo
  const poll = await prisma.poll.create({
    data: {
      id: 'poll_1',
      title: '¿Cuál es tu lenguaje de programación favorito?',
      revealAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 horas desde ahora
      options: {
        create: [
          { text: 'JavaScript / TypeScript' },
          { text: 'Python' },
          { text: 'Go' },
          { text: 'Rust' },
          { text: 'Java' },
        ],
      },
    },
  });

  console.log(`✓ Encuesta creada: ${poll.title}`);
  console.log(`ID: ${poll.id}`);
  console.log(`Resultados se revelarán en: ${poll.revealAt}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✓ Base de datos inicializada correctamente');
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
