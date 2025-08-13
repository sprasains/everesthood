// app/agent/create/page.tsx
import React, { useState } from 'react';
import { AgentInstanceForm } from '../../components/AgentInstanceForm';

const templates = [
	{
		id: 1,
		name: 'OpenAI Summarizer',
		credentials: { openai: { label: 'OpenAI', type: 'password' } },
	},
	{ id: 2, name: 'No-Credential Agent', credentials: null },
];

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

export default function CreateAgentPage({ userId }: { userId: string }) {
	const [selected, setSelected] = useState<number | null>(null);
	const [created, setCreated] = useState(false);
	const [dark, setDark] = useState(false);
	const theme = dark ? darkTheme : lightTheme;

	return (
		<div
			style={{
				minHeight: '100vh',
				background: theme.background,
				transition: 'background 0.3s',
				padding: 0,
			}}
		>
			<div
				style={{
					maxWidth: 480,
					margin: '3rem auto',
					padding: 32,
					background: theme.card,
					borderRadius: 18,
					boxShadow: theme.shadow,
					fontFamily: 'Inter, sans-serif',
					color: theme.text,
					transition: 'background 0.3s, color 0.3s',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 12,
					}}
				>
					<h2
						style={{
							margin: 0,
							fontWeight: 700,
							fontSize: 28,
							letterSpacing: '-1px',
							color: theme.text,
						}}
					>
						Create a New Agent
					</h2>
					<label
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 6,
							cursor: 'pointer',
							fontSize: 14,
							color: theme.accent,
						}}
					>
						<input
							type="checkbox"
							checked={dark}
							onChange={() => setDark(d => !d)}
							style={{
								accentColor: theme.accent,
								width: 18,
								height: 18,
							}}
						/>
						<span>{dark ? '🌙' : '☀️'}</span>
					</label>
				</div>
				<div
					style={{
						marginBottom: 28,
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<label
						htmlFor="template-select"
						style={{
							fontWeight: 500,
							color: theme.accent,
						}}
					>
						Choose a template:
					</label>
					<select
						id="template-select"
						value={selected ?? ''}
						onChange={e => setSelected(Number(e.target.value))}
						style={{
							padding: '10px 12px',
							borderRadius: 8,
							border: `1px solid ${theme.border}`,
							fontSize: 16,
							background: theme.card,
							color: theme.text,
							outline: 'none',
							boxShadow: theme.shadow,
						}}
					>
						<option value="" disabled>
							Select...
						</option>
						{templates.map(t => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>
				</div>
				{selected && !created && (
					<div
						style={{
							background: theme.card,
							borderRadius: 12,
							boxShadow: theme.shadow,
							padding: 24,
							marginBottom: 16,
						}}
					>
						<AgentInstanceForm
							template={templates.find(t => t.id === selected)!}
							userId={userId}
							onCreated={() => setCreated(true)}
						/>
					</div>
				)}
				{created && (
					<div
						style={{
							textAlign: 'center',
							color: theme.success,
							marginTop: 32,
							fontWeight: 600,
							fontSize: 20,
							letterSpacing: '-0.5px',
						}}
					>
						🎉 Agent created and credentials saved!
					</div>
				)}
				<div
					style={{
						marginTop: 32,
						textAlign: 'center',
						color: theme.help,
						fontSize: 14,
					}}
				>
					<span>
						Need help?{' '}
						<a
							href="/help"
							style={{
								color: theme.accent,
								textDecoration: 'underline',
							}}
						>
							Visit the Help Center
						</a>
					</span>
				</div>
			</div>
		</div>
	);
}
