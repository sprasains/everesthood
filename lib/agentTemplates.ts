import { prisma } from './prisma';
import { cacheGet, cacheSet } from './cache';

export const AGENT_TEMPLATES_CACHE_KEY = 'agent-templates:list';
export const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

export async function getAgentTemplatesWithCache() {
  // TEMP: Bypass cache for debugging 500 error
  // const cached = await cacheGet(AGENT_TEMPLATES_CACHE_KEY);
  // if (cached) {
  //   return cached;
  // }
  // Fallback to DB only
  const templates = await prisma.agentTemplate.findMany();
  // await cacheSet(AGENT_TEMPLATES_CACHE_KEY, templates, CACHE_TTL_SECONDS);
  return templates;
} 