import { prisma } from './prisma';

// In-memory cache for feature flags
let featureFlagCache: Record<string, boolean> = {};
let lastFetch = 0;
const CACHE_TTL = 10_000; // 10 seconds

export async function getFeatureFlag(key: string, fallback?: boolean): Promise<boolean> {
  const now = Date.now();
  if (featureFlagCache[key] !== undefined && now - lastFetch < CACHE_TTL) {
    return featureFlagCache[key];
  }
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (flag) {
      featureFlagCache[key] = flag.value;
      lastFetch = now;
      return flag.value;
    }
  } catch (e) {
    // DB might not be ready yet (e.g., during migration)
  }
  if (fallback !== undefined) return fallback;
  return false;
}

export async function isRedisBypassed(): Promise<boolean> {
  // Fallback to env if DB not ready
  const envBypass = process.env.BYPASS_REDIS === 'true';
  return getFeatureFlag('bypass_redis', envBypass);
} 