import { app } from './app.js';
import { config } from './config/index.js';
import { dbStore } from './database/store.js';
import { runSeed } from './database/seed.js';

async function bootstrap() {
  // If store is unpopulated, run seed automatically
  const users = dbStore.getRawData().users;
  if (!users || users.length === 0) {
    console.log('Database store is uninitialized. Running initial seed...');
    await runSeed();
  }

  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 GAP AI Backend API Server is running!`);
    console.log(`🌐 Address: http://localhost:${config.port}`);
    console.log(`🏫 Institution: ${config.institution.name}`);
    console.log(`📚 Department: ${config.institution.department}`);
    console.log(`📅 Semester: ${config.institution.semester} (${config.institution.academicYear})`);
    console.log(`🤖 AI Engine: Groq (${config.groqApiKey ? config.groqModel : 'Local Pedagogical Intelligence Fallback'})`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
