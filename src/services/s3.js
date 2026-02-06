import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/environment.js';

const s3Config = config.s3;

let s3Client = null;

function getClient() {
  if (!s3Client && s3Config.accessKeyId && s3Config.secretAccessKey) {
    s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      },
      forcePathStyle: true
    });
  }
  return s3Client;
}

export function isS3Configured() {
  return !!(s3Config.accessKeyId && s3Config.secretAccessKey && s3Config.bucket);
}

export function buildPhotoKey(applicationId, photoId, fileName) {
  return `applications/${applicationId}/photos/${photoId}_${fileName}`;
}

export async function uploadPhoto(key, buffer, mimeType) {
  const client = getClient();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  await client.send(new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType
  }));

  return key;
}

export async function downloadPhoto(key) {
  const client = getClient();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  const response = await client.send(new GetObjectCommand({
    Bucket: s3Config.bucket,
    Key: key
  }));

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function deletePhotoFromS3(key) {
  const client = getClient();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  await client.send(new DeleteObjectCommand({
    Bucket: s3Config.bucket,
    Key: key
  }));
}
