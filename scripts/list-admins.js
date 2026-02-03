#!/usr/bin/env node

/**
 * Script to list all admins
 * Usage: node scripts/list-admins.js
 */

import prisma from '../src/db/prisma.js';

async function listAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (admins.length === 0) {
      console.log('No admins found in database.');
      return;
    }

    console.log('Admins in database:\n');
    console.log('ID  | Telegram ID       | Username              | Name            | Status');
    console.log('----|-------------------|-----------------------|-----------------|--------');

    for (const admin of admins) {
      const id = String(admin.id).padEnd(3);
      const tgId = String(admin.telegramId).padEnd(17);
      const username = (admin.telegramUsername || '-').padEnd(21);
      const name = admin.fullName.substring(0, 15).padEnd(15);
      const status = admin.status;
      console.log(`${id} | ${tgId} | @${username} | ${name} | ${status}`);
    }

    console.log(`\nTotal: ${admins.length} admin(s)`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
