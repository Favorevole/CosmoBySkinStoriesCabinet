import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import config from '../config/environment.js';

const s3Config = config.s3;

// Magic bytes to identify encrypted files: "ENC1" (0x454E4331)
const ENCRYPTION_MAGIC = Buffer.from([0x45, 0x4E, 0x43, 0x31]);
const IV_LENGTH = 16; // AES-256-GCM uses 16-byte IV
const AUTH_TAG_LENGTH = 16; // GCM auth tag is 16 bytes

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

/**
 * Encrypts a buffer using AES-256-GCM
 * Returns: [MAGIC][IV][AUTH_TAG][ENCRYPTED_DATA]
 */
function encryptBuffer(buffer) {
  // If no encryption key configured, return original (for dev/testing)
  if (!config.encryption.key) {
    console.warn('[SECURITY] ENCRYPTION_KEY not set - storing photos unencrypted!');
    return buffer;
  }

  try {
    const key = Buffer.from(config.encryption.key, 'hex');
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Structure: [MAGIC][IV][AUTH_TAG][ENCRYPTED_DATA]
    return Buffer.concat([
      ENCRYPTION_MAGIC,
      iv,
      authTag,
      encrypted
    ]);
  } catch (error) {
    console.error('[ENCRYPTION] Failed to encrypt:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a buffer using AES-256-GCM
 * Handles both encrypted and legacy unencrypted data
 */
function decryptBuffer(buffer) {
  // Check if data is encrypted (starts with magic bytes)
  if (buffer.length < ENCRYPTION_MAGIC.length ||
      !buffer.subarray(0, ENCRYPTION_MAGIC.length).equals(ENCRYPTION_MAGIC)) {
    // Legacy unencrypted data - return as is
    console.warn('[SECURITY] Reading unencrypted photo (legacy format)');
    return buffer;
  }

  // If no encryption key configured, cannot decrypt
  if (!config.encryption.key) {
    throw new Error('Cannot decrypt: ENCRYPTION_KEY not configured');
  }

  try {
    const key = Buffer.from(config.encryption.key, 'hex');
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    // Extract components
    let offset = ENCRYPTION_MAGIC.length;
    const iv = buffer.subarray(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;

    const authTag = buffer.subarray(offset, offset + AUTH_TAG_LENGTH);
    offset += AUTH_TAG_LENGTH;

    const encrypted = buffer.subarray(offset);

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted;
  } catch (error) {
    console.error('[DECRYPTION] Failed to decrypt:', error.message);
    throw new Error('Failed to decrypt data - file may be corrupted');
  }
}

export function buildPhotoKey(applicationId, photoId, fileName) {
  return `applications/${applicationId}/photos/${photoId}_${fileName}`;
}

export function buildReviewImageKey(reviewId, fileName) {
  return `reviews/${reviewId}/${fileName}`;
}

export async function uploadPhoto(key, buffer, mimeType) {
  const client = getClient();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  // Encrypt the photo before uploading
  const encryptedBuffer = encryptBuffer(buffer);

  await client.send(new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
    Body: encryptedBuffer,
    // Store as binary to hide original content type
    ContentType: 'application/octet-stream',
    // Add server-side encryption as additional layer
    ServerSideEncryption: 'AES256',
    // Store original mime type in metadata for later retrieval
    Metadata: {
      'original-content-type': mimeType,
      'encrypted': 'true'
    }
  }));

  console.log(`[SECURITY] Photo encrypted and uploaded: ${key}`);
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

  // Read encrypted data from S3
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  const encryptedBuffer = Buffer.concat(chunks);

  // Decrypt before returning
  const decryptedBuffer = decryptBuffer(encryptedBuffer);

  console.log(`[SECURITY] Photo decrypted: ${key}`);
  return decryptedBuffer;
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
