#!/usr/bin/env node

/**
 * Script to add admin users to the database
 * Usage: node scripts/add-admins.js
 *
 * Configure admins in the ADMINS array below
 */

import prisma from '../src/db/prisma.js';

// Configure your admins here
const ADMINS = [
  {
    telegramId: BigInt(process.env.ADMIN_TELEGRAM_ID_1 || '0'),
    telegramUsername: 'skinstories_nika', // Main admin
    fullName: 'Nika'
  },
  // Add more admins as needed:
  // {
  //   telegramId: BigInt(process.env.ADMIN_TELEGRAM_ID_2 || '0'),
  //   telegramUsername: 'another_admin',
  //   fullName: 'Another Admin'
  // }
];

async function addAdmins() {
  console.log('Adding admins to database...\n');

  for (const admin of ADMINS) {
    if (admin.telegramId === BigInt(0)) {
      console.log(`Skipping ${admin.telegramUsername} - no telegramId configured`);
      continue;
    }

    try {
      const existing = await prisma.admin.findFirst({
        where: {
          OR: [
            { telegramId: admin.telegramId },
            { telegramUsername: admin.telegramUsername }
          ]
        }
      });

      if (existing) {
        // Update existing admin
        await prisma.admin.update({
          where: { id: existing.id },
          data: {
            telegramId: admin.telegramId,
            telegramUsername: admin.telegramUsername,
            fullName: admin.fullName,
            status: 'ACTIVE'
          }
        });
        console.log(`Updated admin: @${admin.telegramUsername} (ID: ${admin.telegramId})`);
      } else {
        // Create new admin
        await prisma.admin.create({
          data: {
            telegramId: admin.telegramId,
            telegramUsername: admin.telegramUsername,
            fullName: admin.fullName,
            status: 'ACTIVE'
          }
        });
        console.log(`Created admin: @${admin.telegramUsername} (ID: ${admin.telegramId})`);
      }
    } catch (error) {
      console.error(`Error adding admin ${admin.telegramUsername}:`, error.message);
    }
  }

  // List all admins
  console.log('\nAll admins in database:');
  const allAdmins = await prisma.admin.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' }
  });

  for (const a of allAdmins) {
    console.log(`  - @${a.telegramUsername || 'no_username'} (ID: ${a.telegramId}, Name: ${a.fullName})`);
  }

  await prisma.$disconnect();
}

addAdmins().catch(console.error);
