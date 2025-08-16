import { prisma } from '../prisma';
import { encryptSecret, decryptSecret, getActiveKeyId } from '../crypto/secrets';

export async function saveCredential({ userId, agentInstanceId, provider, payload }: {
  userId: string;
  agentInstanceId: string;
  provider: string;
  payload: string;
}) {
  const encrypted = encryptSecret(payload, getActiveKeyId());
  return prisma.agentCredential.create({
    data: {
      userId,
      agentInstanceId,
      provider,
      encryptedPayload: Buffer.from(JSON.stringify(encrypted)),
    },
  });
}

export async function updateCredential({ userId, agentInstanceId, provider, payload }: {
  userId: string;
  agentInstanceId: string;
  provider: string;
  payload: string;
}) {
  const encrypted = encryptSecret(payload, getActiveKeyId());
  return prisma.agentCredential.updateMany({
    where: { userId, agentInstanceId, provider },
    data: { encryptedPayload: Buffer.from(JSON.stringify(encrypted)) },
  });
}

export async function listCredentials(userId: string) {
  return prisma.agentCredential.findMany({ where: { userId } });
}

export async function removeCredential({ userId, agentInstanceId, provider }: {
  userId: string;
  agentInstanceId: string;
  provider: string;
}) {
  return prisma.agentCredential.deleteMany({ where: { userId, agentInstanceId, provider } });
}

export async function getDecryptedCredential({ userId, agentInstanceId, provider }: {
  userId: string;
  agentInstanceId: string;
  provider: string;
}) {
  const cred = await prisma.agentCredential.findFirst({ where: { userId, agentInstanceId, provider } });
  if (!cred) return null;
  const encrypted = JSON.parse(cred.encryptedPayload.toString());
  return decryptSecret(encrypted);
}
