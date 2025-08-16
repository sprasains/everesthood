import { getDecryptedCredential } from '../lib/credentials/store';

/**
 * Retrieve and decrypt credentials for a given agent instance and provider.
 * Only call this inside worker runtime.
 * Redacts secrets from logs, attaches requestId for traceability.
 */
export async function getWorkerCredential({ userId, agentInstanceId, provider, requestId }: {
  userId: string;
  agentInstanceId: string;
  provider: string;
  requestId: string;
}) {
  try {
    const secret = await getDecryptedCredential({ userId, agentInstanceId, provider });
    // DO NOT log secret value
    console.info(`[CREDENTIAL] Retrieved for agentInstanceId=${agentInstanceId}, provider=${provider}, requestId=${requestId}`);
    return secret;
  } catch (err) {
    console.error(`[CREDENTIAL] Error retrieving credential for agentInstanceId=${agentInstanceId}, provider=${provider}, requestId=${requestId}`);
    return null;
  }
}
