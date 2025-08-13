// pages/api/agent-credential.ts
// API route to create/update agent credentials securely
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../../lib/crypto';
import { logCredentialAccess } from '../../lib/audit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, agentId, provider, key, secret } = req.body;
  if (!userId || !agentId || !provider || !key || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Encrypt before storing
  const encryptedKey = encrypt(key);
  const encryptedSecret = encrypt(secret);
  const cred = await prisma.agentCredential.upsert({
    where: { userId_agentId_provider: { userId, agentId, provider } },
    update: { encryptedKey, encryptedSecret },
    create: { userId, agentId, provider, encryptedKey, encryptedSecret },
  });
  await logCredentialAccess({
    userId,
    agentId,
    action: 'CREDENTIAL_CREATE',
    provider,
    details: 'API',
  });
  res.status(200).json({ success: true });
}
