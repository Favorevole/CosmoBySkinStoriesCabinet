import prisma from './prisma.js';

async function retryOperation(operation, maxRetries = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`[DB] Retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function initializeDatabase() {
  console.log('[DB] Connecting to database...');

  await retryOperation(async () => {
    await prisma.$connect();
    console.log('[DB] Connected successfully');
  }, 5, 2000);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('[DB] Disconnected');
}

export { prisma };
