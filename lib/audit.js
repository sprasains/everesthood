// lib/audit.js
// Simple audit logging helper for credential access
// Use the shared prisma singleton
const { prisma } = require('./prisma');

/**
 * Log a credential access event
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} params.agentId
 * @param {string} params.action - e.g. 'CREDENTIAL_DECRYPT', 'CREDENTIAL_CREATE'
 * @param {string} [params.provider]
 * @param {string} [params.details]
 */
async function logCredentialAccess({ userId, agentId, action, provider, details }) {
  await prisma.auditLog.create({
    data: {
      userId,
      agentId,
      action,
      provider,
      details,
    },
  });
}

module.exports = { logCredentialAccess };
