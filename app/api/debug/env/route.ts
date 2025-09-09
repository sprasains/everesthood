import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface EnvironmentCheck {
  category: string;
  variables: Record<string, {
    status: 'set' | 'missing' | 'invalid';
    value?: string;
    description?: string;
    required: boolean;
  }>;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const environment = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      checks: await performEnvironmentChecks(),
      summary: await getEnvironmentSummary()
    };

    return NextResponse.json(environment);
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function performEnvironmentChecks(): Promise<EnvironmentCheck[]> {
  const checks: EnvironmentCheck[] = [
    {
      category: 'Database',
      variables: {
        DATABASE_URL: {
          status: process.env.DATABASE_URL ? 'set' : 'missing',
          value: process.env.DATABASE_URL ? maskSensitiveValue(process.env.DATABASE_URL) : undefined,
          description: 'PostgreSQL database connection string',
          required: true
        }
      }
    },
    {
      category: 'Authentication',
      variables: {
        NEXTAUTH_SECRET: {
          status: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
          value: process.env.NEXTAUTH_SECRET ? maskSensitiveValue(process.env.NEXTAUTH_SECRET) : undefined,
          description: 'Secret key for NextAuth.js',
          required: true
        },
        NEXTAUTH_URL: {
          status: process.env.NEXTAUTH_URL ? 'set' : 'missing',
          value: process.env.NEXTAUTH_URL,
          description: 'Base URL for the application',
          required: true
        }
      }
    },
    {
      category: 'OAuth Providers',
      variables: {
        GOOGLE_CLIENT_ID: {
          status: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing',
          value: process.env.GOOGLE_CLIENT_ID ? maskSensitiveValue(process.env.GOOGLE_CLIENT_ID) : undefined,
          description: 'Google OAuth client ID',
          required: false
        },
        GOOGLE_CLIENT_SECRET: {
          status: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'missing',
          value: process.env.GOOGLE_CLIENT_SECRET ? maskSensitiveValue(process.env.GOOGLE_CLIENT_SECRET) : undefined,
          description: 'Google OAuth client secret',
          required: false
        },
        GITHUB_CLIENT_ID: {
          status: process.env.GITHUB_CLIENT_ID ? 'set' : 'missing',
          value: process.env.GITHUB_CLIENT_ID ? maskSensitiveValue(process.env.GITHUB_CLIENT_ID) : undefined,
          description: 'GitHub OAuth client ID',
          required: false
        },
        GITHUB_CLIENT_SECRET: {
          status: process.env.GITHUB_CLIENT_SECRET ? 'set' : 'missing',
          value: process.env.GITHUB_CLIENT_SECRET ? maskSensitiveValue(process.env.GITHUB_CLIENT_SECRET) : undefined,
          description: 'GitHub OAuth client secret',
          required: false
        }
      }
    },
    {
      category: 'Redis & Queue',
      variables: {
        REDIS_URL: {
          status: process.env.REDIS_URL ? 'set' : 'missing',
          value: process.env.REDIS_URL ? maskSensitiveValue(process.env.REDIS_URL) : undefined,
          description: 'Redis connection string for caching and queues',
          required: false
        }
      }
    },
    {
      category: 'Payment Processing',
      variables: {
        STRIPE_SECRET_KEY: {
          status: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
          value: process.env.STRIPE_SECRET_KEY ? maskSensitiveValue(process.env.STRIPE_SECRET_KEY) : undefined,
          description: 'Stripe secret key for payment processing',
          required: false
        },
        STRIPE_PUBLISHABLE_KEY: {
          status: process.env.STRIPE_PUBLISHABLE_KEY ? 'set' : 'missing',
          value: process.env.STRIPE_PUBLISHABLE_KEY ? maskSensitiveValue(process.env.STRIPE_PUBLISHABLE_KEY) : undefined,
          description: 'Stripe publishable key for client-side',
          required: false
        },
        STRIPE_WEBHOOK_SECRET: {
          status: process.env.STRIPE_WEBHOOK_SECRET ? 'set' : 'missing',
          value: process.env.STRIPE_WEBHOOK_SECRET ? maskSensitiveValue(process.env.STRIPE_WEBHOOK_SECRET) : undefined,
          description: 'Stripe webhook secret for verification',
          required: false
        }
      }
    },
    {
      category: 'Monitoring & Analytics',
      variables: {
        SENTRY_DSN: {
          status: process.env.SENTRY_DSN ? 'set' : 'missing',
          value: process.env.SENTRY_DSN ? maskSensitiveValue(process.env.SENTRY_DSN) : undefined,
          description: 'Sentry DSN for error tracking',
          required: false
        },
        ANALYTICS_ID: {
          status: process.env.ANALYTICS_ID ? 'set' : 'missing',
          value: process.env.ANALYTICS_ID ? maskSensitiveValue(process.env.ANALYTICS_ID) : undefined,
          description: 'Analytics tracking ID',
          required: false
        }
      }
    },
    {
      category: 'File Storage',
      variables: {
        UPLOAD_DIR: {
          status: process.env.UPLOAD_DIR ? 'set' : 'missing',
          value: process.env.UPLOAD_DIR,
          description: 'Directory for file uploads',
          required: false
        },
        MAX_FILE_SIZE: {
          status: process.env.MAX_FILE_SIZE ? 'set' : 'missing',
          value: process.env.MAX_FILE_SIZE,
          description: 'Maximum file upload size',
          required: false
        }
      }
    },
    {
      category: 'Feature Flags',
      variables: {
        FEATURE_DEBUG: {
          status: process.env.FEATURE_DEBUG ? 'set' : 'missing',
          value: process.env.FEATURE_DEBUG,
          description: 'Enable debug features',
          required: false
        },
        FEATURE_ANALYTICS: {
          status: process.env.FEATURE_ANALYTICS ? 'set' : 'missing',
          value: process.env.FEATURE_ANALYTICS,
          description: 'Enable analytics tracking',
          required: false
        },
        FEATURE_QUEUE: {
          status: process.env.FEATURE_QUEUE ? 'set' : 'missing',
          value: process.env.FEATURE_QUEUE,
          description: 'Enable background job processing',
          required: false
        }
      }
    },
    {
      category: 'Security',
      variables: {
        CORS_ORIGIN: {
          status: process.env.CORS_ORIGIN ? 'set' : 'missing',
          value: process.env.CORS_ORIGIN,
          description: 'Allowed CORS origins',
          required: false
        },
        RATE_LIMIT_MAX: {
          status: process.env.RATE_LIMIT_MAX ? 'set' : 'missing',
          value: process.env.RATE_LIMIT_MAX,
          description: 'Maximum requests per window',
          required: false
        },
        RATE_LIMIT_WINDOW: {
          status: process.env.RATE_LIMIT_WINDOW ? 'set' : 'missing',
          value: process.env.RATE_LIMIT_WINDOW,
          description: 'Rate limit window in milliseconds',
          required: false
        }
      }
    }
  ];

  return checks;
}

async function getEnvironmentSummary() {
  const allVars = Object.values((await performEnvironmentChecks()).flatMap(check => check.variables));
  const requiredVars = allVars.filter(v => v.required);
  const optionalVars = allVars.filter(v => !v.required);
  
  const requiredSet = requiredVars.filter(v => v.status === 'set').length;
  const requiredMissing = requiredVars.filter(v => v.status === 'missing').length;
  
  const optionalSet = optionalVars.filter(v => v.status === 'set').length;
  const optionalMissing = optionalVars.filter(v => v.status === 'missing').length;
  
  const totalSet = requiredSet + optionalSet;
  const totalMissing = requiredMissing + optionalMissing;
  
  return {
    total: {
      set: totalSet,
      missing: totalMissing,
      percentage: Math.round((totalSet / (totalSet + totalMissing)) * 100)
    },
    required: {
      set: requiredSet,
      missing: requiredMissing,
      percentage: Math.round((requiredSet / (requiredSet + requiredMissing)) * 100)
    },
    optional: {
      set: optionalSet,
      missing: optionalMissing,
      percentage: Math.round((optionalSet / (optionalSet + optionalMissing)) * 100)
    },
    status: requiredMissing === 0 ? 'healthy' : 'unhealthy',
    recommendations: generateRecommendations(requiredMissing, optionalMissing)
  };
}

function generateRecommendations(requiredMissing: number, optionalMissing: number): string[] {
  const recommendations: string[] = [];
  
  if (requiredMissing > 0) {
    recommendations.push(`Fix ${requiredMissing} missing required environment variables`);
  }
  
  if (optionalMissing > 0) {
    recommendations.push(`Consider setting ${optionalMissing} optional environment variables for enhanced functionality`);
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SENTRY_DSN) {
      recommendations.push('Set SENTRY_DSN for production error tracking');
    }
    if (!process.env.REDIS_URL) {
      recommendations.push('Set REDIS_URL for production caching and queue processing');
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      recommendations.push('Set STRIPE_SECRET_KEY for production payment processing');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Environment configuration looks good!');
  }
  
  return recommendations;
}

function maskSensitiveValue(value: string): string {
  if (!value) return '';
  
  // Mask different types of sensitive values
  if (value.startsWith('sk_') || value.startsWith('pk_')) {
    // Stripe keys
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  }
  
  if (value.startsWith('http')) {
    // URLs - mask password if present
    try {
      const url = new URL(value);
      if (url.password) {
        url.password = '***';
      }
      return url.toString();
    } catch {
      return value.substring(0, 20) + '...';
    }
  }
  
  if (value.length > 20) {
    // Long strings (likely secrets)
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  }
  
  return value;
}
