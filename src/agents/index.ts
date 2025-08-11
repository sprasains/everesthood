// src/agents/index.ts
// Dynamic agent registry: discovers and loads all agent modules in this directory.
import fs from 'fs';
import path from 'path';

export type AgentHandler = {
  run: (input: any, mode: string, userId: string, creds?: any) => Promise<any>;
  init?: (input: any) => Promise<any>;
  runStep?: (state: any) => Promise<any>;
};

const handlers: Record<string, AgentHandler> = {};
const agentsDir = __dirname;

fs.readdirSync(agentsDir).forEach(file => {
  if (!file.endsWith('.ts') && !file.endsWith('.js')) return;
  if (file === 'index.ts' || file === 'index.js' || file.startsWith('_') || file === 'README.md') return;
  const name = file.replace(/\.(ts|js)$/, '');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(`./${name}`) as AgentHandler;
  if (mod.run) handlers[name] = mod;
});

export function getAgentHandler(name: string): AgentHandler | undefined {
  return handlers[name];
}
export const agentNames = Object.keys(handlers);
