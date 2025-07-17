"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Paper, Stack, Typography, Chip, Fade } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

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
}

export default function AgentTemplateListPage() {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [sort, setSort] = useState<"name" | "model">("name");

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

  // Filter, search, and sort logic
  const filteredTemplates = templates
    .filter((tpl) => {
      if (filter === "public") return tpl.isPublic;
      if (filter === "private") return !tpl.isPublic;
      return true;
    })
    .filter((tpl) =>
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "model") return a.defaultModel.localeCompare(b.defaultModel);
      return 0;
    });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 6 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={4}>
        <Typography variant="h4" fontWeight="bold">Agent Templates</Typography>
        <Link href="/agents/templates/create">
          <Button variant="contained" startIcon={<PlusCircledIcon />}>Create New Template</Button>
        </Link>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} flexWrap="wrap">
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sort}
            label="Sort By"
            onChange={(e) => setSort(e.target.value as any)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="model">Model</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Box sx={{ borderBottom: '1px solid #eee', mb: 4 }} />
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}><Typography>Loading templates...</Typography></Box>
      ) : error ? (
        <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}><Typography>Error: {error}</Typography></Box>
      ) : filteredTemplates.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography>No agent templates found.</Typography>
          <Link href="/agents/templates/create">
            <Button variant="outlined">Create your first template</Button>
          </Link>
        </Box>
      ) : (
        <Stack direction="column" spacing={3}>
          {filteredTemplates.map((tpl, idx) => (
            <Fade in timeout={400 + idx * 80} key={tpl.id}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">{tpl.name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{tpl.description}</Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip label={tpl.isPublic ? 'Public' : 'Private'} color={tpl.isPublic ? 'success' : 'default'} size="small" />
                    <Chip label={`v${tpl.version}`} size="small" />
                    <Chip label={tpl.defaultModel} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Tools: {tpl.defaultTools.join(', ') || 'None'}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Link href={`/agents/templates/${tpl.id}`}>
                    <Button variant="outlined">View / Edit</Button>
                  </Link>
                </Stack>
              </Paper>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
} 