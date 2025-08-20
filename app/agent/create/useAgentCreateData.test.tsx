import { renderHook, act } from '@testing-library/react-hooks';
import { useAgentCreateData } from './useAgentCreateData';

jest.mock('../../../lib/agentMarketplaceApi', () => ({
  getAgentTemplates: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test' }])),
  getOrgInfo: jest.fn(() => Promise.resolve({ name: 'Org', tenantId: 't1' })),
  getUserBilling: jest.fn(() => Promise.resolve({ status: 'active', plan: 'pro' })),
  getFeatureFlags: jest.fn(() => Promise.resolve([])),
  getUsageMeter: jest.fn(() => Promise.resolve({ count: 1, credits: 10 })),
  getAuditLogs: jest.fn(() => Promise.resolve([])),
  getRunHistory: jest.fn(() => Promise.resolve([])),
}));

describe('useAgentCreateData', () => {
  it('loads agent creation data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAgentCreateData('u1', null));
    await waitForNextUpdate();
    expect(result.current.templates.length).toBe(1);
    expect(result.current.orgInfo.name).toBe('Org');
    expect(result.current.billing.plan).toBe('pro');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads run history when template is selected', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ userId, selected }) => useAgentCreateData(userId, selected),
      { initialProps: { userId: 'u1', selected: null } }
    );
    await waitForNextUpdate();
    act(() => rerender({ userId: 'u1', selected: 1 }));
    await waitForNextUpdate();
    expect(result.current.runHistory).toEqual([]);
    expect(result.current.templateDetails).toEqual({ id: 1, name: 'Test' });
  });
});
