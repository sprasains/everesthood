/**
 * This file contains all API route types for type-safe API calls
 */

import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/api/root';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Agent Types
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  version: number;
  tools?: Record<string, any>;
  category?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AgentTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  config: Record<string, any>;
  prompt: string;
  tools?: Record<string, any>;
  createdAt: Date;
}

export interface AgentInstance {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  configOverride?: Record<string, any>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AgentRun {
  id: string;
  agentId: string;
  userId: string;
  status:
    | 'PENDING'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'AWAITING_INPUT';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
  credits?: number;
  error?: string;
  results?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Billing Types
export interface BillingRecord {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  currentUsage: number;
  lastUpdated: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UsageRecord {
  id: string;
  billingId: string;
  quantity: number;
  timestamp: Date;
}

export interface BillingReport {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  data: Array<{ period: string; usage: number }>;
  totalUsage: number;
  status: 'pending' | 'completed' | 'failed';
  fileUrl?: string;
  fileType?: string;
  error?: string;
  createdAt: Date;
}

// User Types
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  credits: number;
  role: 'USER' | 'ORG_ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
