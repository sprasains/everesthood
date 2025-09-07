# 🔒 Security Guide

## Overview
This guide outlines our security practices and requirements.

## Authentication

### User Authentication
```typescript
// Protected API routes
export const auth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// Protected procedures
export const protectedProcedure = t.procedure.use(auth);
```

### Session Management
```typescript
// Next-Auth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    // OAuth providers...
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
```

## Input Validation

### API Input Validation
```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  name: z.string().min(2).max(50),
});

export const createUser = protectedProcedure
  .input(userSchema)
  .mutation(async ({ input }) => {
    // Input is validated
  });
```

### File Upload Validation
```typescript
const fileSchema = z.object({
  name: z.string(),
  type: z.enum(['image/jpeg', 'image/png']),
  size: z.number().max(5 * 1024 * 1024), // 5MB
});
```

## Rate Limiting

### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Login Rate Limiting
```typescript
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later',
});
```

## XSS Prevention

### Content Security Policy
```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      connect-src 'self' ${process.env.API_URL};
    `,
  },
];

export default {
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
};
```

### XSS Sanitization
```typescript
import { sanitize } from 'dompurify';

// Sanitize user input
const sanitizedHtml = sanitize(userInput);
```

## CSRF Protection

### CSRF Token
```typescript
// Middleware
app.use(csrf());

// Form submission
<form>
  <input type="hidden" name="_csrf" value={csrfToken} />
  {/* form fields */}
</form>
```

## SQL Injection Prevention

### Prisma ORM
```typescript
// Safe - uses parameterized queries
const user = await prisma.user.findUnique({
  where: { email },
});

// Safe - uses parameterized queries
const users = await prisma.user.findMany({
  where: {
    email: { contains: searchTerm },
  },
});
```

## Sensitive Data

### Environment Variables
```typescript
// .env.example
DATABASE_URL=
NEXTAUTH_SECRET=
STRIPE_SECRET_KEY=

// Validate environment variables
const env = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
}).parse(process.env);
```

### Password Hashing
```typescript
import { hash, compare } from 'bcryptjs';

// Hash password
const hashedPassword = await hash(password, 12);

// Verify password
const isValid = await compare(password, hashedPassword);
```

## Error Handling

### Safe Error Responses
```typescript
// Don't expose internal errors
try {
  await operation();
} catch (error) {
  console.error('Internal error:', error);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  });
}
```

## Logging

### Security Events
```typescript
await logger.info('auth.login.success', {
  userId,
  ip: req.ip,
});

await logger.warn('auth.login.failed', {
  email,
  ip: req.ip,
  reason: 'Invalid credentials',
});
```

## Security Headers

### HTTP Headers
```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];
```

## Audit

### Code Scanning
```bash
# Run security audit
pnpm audit

# Run SAST tools
pnpm run security:scan

# Check for known vulnerabilities
pnpm run security:check
```

## Incident Response

### Security Contacts
- Security Team: security@company.com
- Emergency Contact: +1-XXX-XXX-XXXX

### Response Process
1. Identify and isolate
2. Assess impact
3. Fix vulnerability
4. Review and improve

## Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
