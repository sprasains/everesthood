// lib/agentMarketplaceApi.ts
// Agent marketplace API integration with backend

import axios from 'axios';

const API_BASE = '/api/agent-marketplace';

// Replace stub API calls with real backend endpoints
export async function getAgentTemplates() {
  const res = await axios.get(`${API_BASE}/templates`);
  return res.data;
}

export async function getOrgInfo(userId: string) {
  const res = await axios.get(`${API_BASE}/org-info`, { params: { userId } });
  return res.data;
}

export async function getUserBilling(userId: string) {
  const res = await axios.get(`${API_BASE}/billing`, { params: { userId } });
  return res.data;
}

export async function getFeatureFlags(userId: string) {
  const res = await axios.get(`${API_BASE}/feature-flags`, { params: { userId } });
  return res.data;
}

export async function getUsageMeter(userId: string) {
  const res = await axios.get(`${API_BASE}/usage`, { params: { userId } });
  return res.data;
}

export async function getAuditLogs(userId: string) {
  const res = await axios.get(`${API_BASE}/audit-logs`, { params: { userId } });
  return res.data;
}

export async function getRunHistory(userId: string, templateId: number) {
  const res = await axios.get(`${API_BASE}/run-history`, { params: { userId, templateId } });
  return res.data;
}
