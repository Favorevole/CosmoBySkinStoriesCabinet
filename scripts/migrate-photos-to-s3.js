#!/usr/bin/env node

/**
 * Migrate existing photos from PostgreSQL (Bytes) to Selectel S3.
 *
 * For each photo where s3Key is null and data is not null:
 *   1. Upload data to S3
 *   2. Set s3Key on the record
 *   3. Clear data (set to null)
 *
 * Usage: node scripts/migrate-photos-to-s3.js [--dry-run] [--batch-size=50]
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.development'), override: true });
dotenv.config();

const { PrismaClient } = await import('@prisma/client');
const { isS3Configured, buildPhotoKey, uploadPhoto } = await import('../src/services/s3.js');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const batchSizeArg = args.find(a => a.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 50;

const prisma = new PrismaClient();

async function main() {
  if (!isS3Configured()) {
    console.error('S3 is not configured. Set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET.');
    process.exit(1);
  }

  console.log(`Migration mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Batch size: ${batchSize}\n`);

  const totalCount = await prisma.photo.count({
    where: { s3Key: null, data: { not: null } }
  });

  console.log(`Found ${totalCount} photos to migrate.\n`);

  if (totalCount === 0) {
    console.log('Nothing to do.');
    return;
  }

  let migrated = 0;
  let failed = 0;

  while (true) {
    const photos = await prisma.photo.findMany({
      where: { s3Key: null, data: { not: null } },
      select: { id: true, applicationId: true, fileName: true, mimeType: true, data: true },
      take: batchSize
    });

    if (photos.length === 0) break;

    for (const photo of photos) {
      const key = buildPhotoKey(photo.applicationId, photo.id, photo.fileName);

      try {
        if (dryRun) {
          console.log(`[DRY RUN] Would upload photo #${photo.id} → ${key} (${photo.data.length} bytes)`);
        } else {
          const buffer = Buffer.isBuffer(photo.data) ? photo.data : Buffer.from(photo.data);
          await uploadPhoto(key, buffer, photo.mimeType);

          await prisma.photo.update({
            where: { id: photo.id },
            data: { s3Key: key, data: null }
          });

          console.log(`Migrated photo #${photo.id} → ${key}`);
        }
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate photo #${photo.id}: ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
}

main()
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
