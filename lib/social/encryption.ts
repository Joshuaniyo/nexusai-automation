import { createCipheriv, createHash, randomBytes } from 'node:crypto';

function encryptionKey(): Buffer {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY?.trim();
  if (!secret || secret.length < 32) throw new Error('SOCIAL_TOKEN_ENCRYPTION_KEY must contain at least 32 characters.');
  return createHash('sha256').update(secret).digest();
}

export function encryptSocialToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
}
