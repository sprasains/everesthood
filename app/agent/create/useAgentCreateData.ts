import { useState, useEffect } from 'react';
import { getAgentTemplates, getUserBilling, getRunHistory, getFeatureFlags, getUsageMeter, getAuditLogs, getOrgInfo } from '../../lib/agentMarketplaceApi';

export function useAgentCreateData(userId: string, selected: number | null) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateDetails, setTemplateDetails] = useState<any | null>(null);
  const [billing, setBilling] = useState<any | null>(null);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [usage, setUsage] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [orgInfo, setOrgInfo] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAgentTemplates(),
      getOrgInfo(userId),
      getUserBilling(userId),
      getFeatureFlags(userId),
      getUsageMeter(userId),
      getAuditLogs(userId)
    ])
      .then(([templates, orgInfo, billing, featureFlags, usage, auditLogs]) => {
        setTemplates(templates);
        setOrgInfo(orgInfo);
        setBilling(billing);
        setFeatureFlags(featureFlags);
        setUsage(usage);
        setAuditLogs(auditLogs);
        setError(null);
      })
      .catch(e => {
        setError('Failed to load agent creation data');
        console.error('Agent creation data error:', e);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (selected) {
      const t = templates.find(t => t.id === selected);
      setTemplateDetails(t);
      setLoading(true);
      getRunHistory(userId, selected)
        .then(setRunHistory)
        .catch(e => {
          setError('Failed to load run history');
          console.error('Run history error:', e);
        })
        .finally(() => setLoading(false));
    }
  }, [selected, templates, userId]);

  return {
    templates,
    templateDetails,
    billing,
    runHistory,
    featureFlags,
    usage,
    auditLogs,
    orgInfo,
    loading,
    error,
  };
}
