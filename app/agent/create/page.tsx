"use client";
// app/agent/create/page.tsx
import React, { useState } from 'react';
import { AgentInstanceForm } from '../../components/AgentInstanceForm';
import { useAgentCreateData } from './useAgentCreateData';
import { isAdmin } from '../../../lib/auth/roles';

// TODO(GAP REPORT: #1-AgentTemplates): Add Zod validation for agent template config
// TODO(GAP REPORT: #7-Auth): Enforce RBAC and org boundaries in agent creation
// TODO(GAP REPORT: #5-Billing): Enforce usage metering in billing API
// TODO(GAP REPORT: #6-Credentials): Encrypt secrets at rest for credentials
// TODO(GAP REPORT: #8-Security): Add OWASP checks and cache headers

const lightTheme = {
	background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
	card: '#fff',
	text: '#3730a3',
	accent: '#6366f1',
	border: '#c7d2fe',
	shadow: '0 4px 24px #0002',
	success: '#059669',
	help: '#64748b',
};
const darkTheme = {
	background: 'linear-gradient(135deg, #18181b 0%, #312e81 100%)',
	card: '#232136',
	text: '#e0e7ff',
	accent: '#a5b4fc',
	border: '#3730a3',
	shadow: '0 4px 24px #0008',
	success: '#34d399',
	help: '#a1a1aa',
};

export default function CreateAgentPage({ userId, user }: { userId: string, user: any }) {
	const [selected, setSelected] = useState<number | null>(null);
	const [created, setCreated] = useState(false);
	const [dark, setDark] = useState(false);
	const theme = dark ? darkTheme : lightTheme;

	const {
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
	} = useAgentCreateData(userId, selected);

	const canCreate = isAdmin(user) && orgInfo?.tenantId === user?.tenantId;

	function handleAgentCreated() {
		setCreated(true);
		console.log('Agent creation attempt:', {
			userId,
			selected,
			templateDetails,
			orgInfo,
		});
	}

	return (
		<div style={{ minHeight: '100vh', background: theme.background, transition: 'background 0.3s', padding: 0 }}>
			<div style={{ maxWidth: 540, margin: '3rem auto', padding: 32, background: theme.card, borderRadius: 18, boxShadow: theme.shadow, fontFamily: 'Inter, sans-serif', color: theme.text, transition: 'background 0.3s, color 0.3s' }}>
				{/* Header and theme toggle */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
					<h2 style={{ margin: 0, fontWeight: 700, fontSize: 28, letterSpacing: '-1px', color: theme.text }}>Create a New Agent</h2>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: theme.accent }}>
						<input type="checkbox" checked={dark} onChange={() => setDark(d => !d)} style={{ accentColor: theme.accent, width: 18, height: 18 }} />
						<span>{dark ? '🌙' : '☀️'}</span>
					</label>
				</div>
				{/* Error and loading states */}
				{loading && <div style={{ color: theme.help, marginBottom: 16 }}>Loading...</div>}
				{error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
				{/* Organization/Tenant Info */}
				{orgInfo && (
					<div style={{ marginBottom: 16, fontSize: 15, color: theme.help }}>
						Org: <b>{orgInfo.name}</b> | Tenant: <b>{orgInfo.tenantId}</b>
					</div>
				)}
				{/* Template selection */}
				<div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
					<label htmlFor="template-select" style={{ fontWeight: 500, color: theme.accent }}>Choose a template:</label>
					<select id="template-select" value={selected ?? ''} onChange={e => setSelected(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 16, background: theme.card, color: theme.text, outline: 'none', boxShadow: theme.shadow }}>
						<option value="" disabled>Select...</option>
						{templates.map(t => (
							<option key={t.id} value={t.id}>{t.name}</option>
						))}
					</select>
				</div>
				{/* Block agent creation for non-admins or wrong tenant */}
				{!canCreate && (
					<div style={{ color: 'red', marginBottom: 16 }}>
						You do not have permission to create agents for this organization.
					</div>
				)}
				{/* Template details, multi-step config, credentials, run history, billing, feature flags, usage, audit logs */}
				{selected && templateDetails && !created && canCreate && (
					<div style={{ background: theme.card, borderRadius: 12, boxShadow: theme.shadow, padding: 24, marginBottom: 16 }}>
						<h3 style={{ margin: '0 0 8px', fontWeight: 600, color: theme.accent }}>{templateDetails.name}</h3>
						<p style={{ margin: '0 0 12px', color: theme.help }}>{templateDetails.description}</p>
						{templateDetails.features && (
							<div style={{ marginBottom: 10 }}>
								<b>Features:</b> {templateDetails.features.join(', ')}
							</div>
						)}
						{templateDetails.steps && templateDetails.steps.length > 0 && (
							<div style={{ marginBottom: 10 }}>
								<b>Multi-Step Config:</b>
								<ul style={{ margin: '6px 0 0 16px', color: theme.text }}>
									{templateDetails.steps.map((step: any, i: number) => (
										<li key={i}>{step.label}: {step.description}</li>
									))}
								</ul>
							</div>
						)}
						{/* Credential input (advanced types) */}
						{templateDetails.credentials && (
							<div style={{ marginBottom: 10 }}>
								<b>Credentials:</b>
								<ul style={{ margin: '6px 0 0 16px', color: theme.text }}>
									{Object.entries(templateDetails.credentials).map(([key, cred]: any) => (
										<li key={key}>{cred.label} ({cred.type})</li>
									))}
								</ul>
							</div>
						)}
						{/* Usage metering */}
						{usage && (
							<div style={{ marginBottom: 10 }}>
								<b>Usage:</b> {usage.count} runs, {usage.credits} credits used
							</div>
						)}
						{/* Billing info */}
						{billing && (
							<div style={{ marginBottom: 10 }}>
								<b>Billing:</b> {billing.status} | Plan: {billing.plan}
							</div>
						)}
						{/* Feature flags */}
						{featureFlags && featureFlags.length > 0 && (
							<div style={{ marginBottom: 10 }}>
								<b>Feature Flags:</b>
								<ul style={{ margin: '6px 0 0 16px', color: theme.text }}>
									{featureFlags.map((flag: any) => (
										<li key={flag.name}>{flag.name}: {flag.enabled ? 'Enabled' : 'Disabled'}{flag.admin && <button style={{ marginLeft: 8, fontSize: 12 }} onClick={() => flag.toggle()}>{flag.enabled ? 'Disable' : 'Enable'}</button>}</li>
									))}
								</ul>
							</div>
						)}
						{/* Run history preview */}
						{runHistory && runHistory.length > 0 && (
							<div style={{ marginBottom: 10 }}>
								<b>Recent Runs:</b>
								<ul style={{ margin: '6px 0 0 16px', color: theme.text }}>
									{runHistory.slice(0, 5).map((run: any) => (
										<li key={run.id}>#{run.id} {run.status} ({run.startedAt})</li>
									))}
								</ul>
							</div>
						)}
						{/* Audit logs */}
						{auditLogs && auditLogs.length > 0 && (
							<div style={{ marginBottom: 10 }}>
								<b>Audit Logs:</b>
								<ul style={{ margin: '6px 0 0 16px', color: theme.text }}>
									{auditLogs.slice(0, 3).map((log: any) => (
										<li key={log.id}>{log.event} ({log.timestamp})</li>
									))}
								</ul>
							</div>
						)}
						{/* Health/resource status, job queue info, DLQ status */}
						{templateDetails.health && (
							<div style={{ marginBottom: 10 }}>
								<b>Health:</b> {templateDetails.health.status} | Resources: {templateDetails.health.resources}
							</div>
						)}
						{templateDetails.jobQueue && (
							<div style={{ marginBottom: 10 }}>
								<b>Job Queue:</b> {templateDetails.jobQueue.status} | DLQ: {templateDetails.jobQueue.dlq}
							</div>
						)}
						{/* Multi-step agent config and form */}
						<AgentInstanceForm template={templateDetails} userId={userId} onCreated={handleAgentCreated} />
					</div>
				)}
				{/* Success message */}
				{created && (
					<div style={{ textAlign: 'center', color: theme.success, marginTop: 32, fontWeight: 600, fontSize: 20, letterSpacing: '-0.5px' }}>
						🎉 Agent created and credentials saved!
					</div>
				)}
				{/* Help Center */}
				<div style={{ marginTop: 32, textAlign: 'center', color: theme.help, fontSize: 14 }}>
					<span>
						Need help?{' '}
						<a href="/help" style={{ color: theme.accent, textDecoration: 'underline' }}>Visit the Help Center</a>
					</span>
				</div>
			</div>
		</div>
	);
}
