#!/usr/bin/env node

/**
 * Interactive script to add a single admin
 * Usage: node scripts/add-admin.js <telegramId> <username> <fullName>
 * Example: node scripts/add-admin.js 123456789 skinstories_nika "Nika"
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
dotenv.config();

import prisma from '../src/db/prisma.js';

async function addAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node scripts/add-admin.js <telegramId> <username> <fullName>');
    console.log('Example: node scripts/add-admin.js 123456789 skinstories_nika "Nika"');
    process.exit(1);
  }

  const [telegramId, username, fullName] = args;
  const cleanUsername = username.replace(/^@/, '');

  try {
    const existing = await prisma.admin.findFirst({
      where: {
        OR: [
          { telegramId: BigInt(telegramId) },
          { telegramUsername: cleanUsername }
        ]
      }
    });

    if (existing) {
      await prisma.admin.update({
        where: { id: existing.id },
        data: {
          telegramId: BigInt(telegramId),
          telegramUsername: cleanUsername,
          fullName: fullName,
          status: 'ACTIVE'
        }
      });
      console.log(`Updated admin: @${cleanUsername}`);
    } else {
      await prisma.admin.create({
        data: {
          telegramId: BigInt(telegramId),
          telegramUsername: cleanUsername,
          fullName: fullName,
          status: 'ACTIVE'
        }
      });
      console.log(`Created admin: @${cleanUsername}`);
    }

    console.log(`\nAdmin can now login at /login using username: ${cleanUsername}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin();
