"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Typography, Chip, Button, CircularProgress, Stack, Fade } from "@mui/material";
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

// Expanded icon mapping for more categories
const categoryIcons: Record<string, React.ReactNode> = {
  All: '🤖',
  Finance: '💸',
  Content: '📝',
  Lifestyle: '🌱',
  Productivity: '⚡',
  Health: '💪',
  AI: '🧠',
  Automation: '🤖',
  Education: '🎓',
  Social: '🗣️',
  Marketing: '📈',
  Research: '🔬',
  Wellness: '🧘',
  Personal: '👤',
  Utility: '🛠️',
  Custom: '✨',
  Default: '🤖',
};

const categories = [
  "All", "Finance", "Content", "Lifestyle", "Productivity", "Health", "AI", "Automation", "Education", "Social", "Marketing", "Research", "Wellness", "Personal", "Utility", "Custom"
];

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  defaultModel: string;
  defaultTools: string[];
  isPublic: boolean;
  version: number;
  isLatest: boolean;
  category?: string;
}

export default function AgentTemplateListPage() {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [createModal, setCreateModal] = useState<{ open: boolean; template?: AgentTemplate }>({ open: false });
  const [creating, setCreating] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/v1/agents/templates");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTemplates(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Filter and search logic
  const filteredTemplates = templates
    .filter((tpl) =>
      activeCategory === "All" ? true : tpl.category === activeCategory
    )
    .filter((tpl) =>
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase())
    );

  // Enhanced agent name validation
  const validateAgentName = (name: string) => {
    if (!name.trim()) return 'Agent name is required.';
    if (name.length < 3) return 'Name must be at least 3 characters.';
    if (!/^[\w\s-]+$/.test(name)) return 'Name can only contain letters, numbers, spaces, - and _.';
    return null;
  };

  // Handle agent creation
  const handleCreateAgent = async () => {
    const err = validateAgentName(agentName);
    setNameError(err);
    if (err || !createModal.template) return;
    setCreating(true);
    try {
      const res = await fetch('/api/v1/agents/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          templateId: createModal.template.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to create agent');
      const data = await res.json();
      toast.success('Agent created! Redirecting...');
      setCreateModal({ open: false });
      setAgentName("");
      setNameError(null);
      window.location.href = `/agents/${data.id}`;
    } catch (e: any) {
      toast.error(e.message || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 6 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Agent Marketplace</Typography>
      {/* Category Filters */}
      <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "contained" : "outlined"}
            color={activeCategory === cat ? "primary" : "inherit"}
            onClick={() => setActiveCategory(cat)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {categoryIcons[cat] || categoryIcons.Default} {cat}
          </Button>
        ))}
      </Stack>
      {/* Search */}
      <Box mb={4}>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-md"
        />
      </Box>
      {/* Grid of Cards */}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}><Typography>Error: {error}</Typography></Box>
      ) : filteredTemplates.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography>No agent templates found.</Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl, idx) => (
            <Fade in timeout={400 + idx * 80} key={tpl.id}>
              <div>
                <Card
                  title={tpl.name}
                  subtitle={tpl.description}
                  variant="elevated"
                  size="md"
                  headerAction={<Chip label={tpl.category || 'General'} size="small" />}
                  footer={
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setCreateModal({ open: true, template: tpl })}
                    >
                      Create Agent
                    </Button>
                  }
                >
                  <Box sx={{ fontSize: 40, mb: 2, textAlign: 'center' }}>
                    {categoryIcons[tpl.category || 'Default']}
                  </Box>
                  <Typography variant="caption" color="text.secondary">Model: {tpl.defaultModel}</Typography>
                </Card>
              </div>
            </Fade>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        open={createModal.open}
        onClose={() => { setCreateModal({ open: false }); setNameError(null); }}
        title={`Create Agent from "${createModal.template?.name || ''}"`}
        variant="glass"
        size="sm"
        actions={{
          primary: {
            label: creating ? 'Creating...' : 'Create Agent',
            onClick: handleCreateAgent,
            disabled: creating || !agentName.trim() || !!nameError,
            loading: creating,
          },
          cancel: {
            onClick: () => { setCreateModal({ open: false }); setNameError(null); },
          },
        }}
      >
        {createModal.template && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ fontSize: 36 }}>{categoryIcons[createModal.template.category || 'Default']}</Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{createModal.template.name}</Typography>
              <Typography variant="body2" color="text.secondary">{createModal.template.description}</Typography>
              <Typography variant="caption" color="text.secondary">Model: {createModal.template.defaultModel}</Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" mb={1}>Give your new agent a name:</Typography>
          <input
            type="text"
            value={agentName}
            onChange={e => {
              setAgentName(e.target.value);
              setNameError(validateAgentName(e.target.value));
            }}
            placeholder="Agent name..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
            autoFocus
          />
          {nameError && <Typography color="error" variant="caption" mt={1}>{nameError}</Typography>}
        </Box>
      </Modal>
    </Box>
  );
} 