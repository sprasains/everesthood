# Everesthood Agent Credential Security

## Threat Model
- Credentials are encrypted at rest using AES-256-GCM with key rotation.
- Only workers at runtime can decrypt credentials; never sent back to client.
- Secrets are redacted from logs; only requestId is attached for traceability.
- Optional support for external secret backends (AWS KMS, GCP KMS) via provider adapter.
- UI is write-only: users can submit but not read credentials.

## Logger and Tracing Setup
- All logs use Pino with redaction of secrets and sensitive fields.
- Each request and agent run is tagged with a unique `requestId` and `jobId` for traceability.
- Distributed tracing is enabled via OpenTelemetry; traces are exported to the configured backend (e.g., Jaeger, OTLP).
- Prometheus metrics are exposed via `/api/metrics` endpoint, with access restricted to authorized users.
- Never log decrypted credentials, secrets, or sensitive payloads.
- Use structured logging for all API routes, workers, and tools.
- Correlate logs, traces, and metrics using `requestId` and `jobId`.
- Audit logs regularly for suspicious access patterns.
- Troubleshooting docs include log tailing and `jq` filter examples for secure analysis.

## Key Rotation Steps
1. Generate a new 32-byte key and add to environment as `AGENT_CREDENTIAL_KEY_V2` (hex).
2. Update `lib/crypto/secrets.ts` to include new keyId.
3. Set new keyId as default for new credentials.
4. Migrate old credentials by decrypting with old key and re-encrypting with new key.
5. Remove old key from environment after migration and validation.

## Breach Response Playbook
- If a credential leak is suspected:
  1. Rotate encryption keys immediately.
  2. Invalidate all agent tokens and credentials.
  3. Notify affected users and reset credentials.
  4. Audit logs for suspicious access (using requestId).
  5. Review and patch any vulnerabilities in credential handling code.

## Best Practices
- Never log secrets or decrypted payloads.
- Use environment variables for key management; restrict access.
- Regularly rotate keys and audit credential access.
- Use external KMS for production if possible.
- Enforce RBAC and org boundaries for credential access.

## References
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
