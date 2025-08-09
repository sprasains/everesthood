"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack
} from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SummarizeIcon from "@mui/icons-material/Summarize";
import DescriptionIcon from "@mui/icons-material/Description";
import SchoolIcon from "@mui/icons-material/School";
import ArticleIcon from "@mui/icons-material/Article";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

export default function HelpCenterPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Help Center
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Guides, walkthroughs, and resources to get the most out of Everesthood
        </Typography>
      </Box>

      {/* Quick actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            component={Link}
            href="/agents/templates/create"
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            sx={{ textTransform: "none" }}
          >
            Create an AI Assistant
          </Button>
          <Button
            component={Link}
            href="/agents/templates"
            variant="outlined"
            startIcon={<SummarizeIcon />}
            sx={{ textTransform: "none" }}
          >
            Browse Templates
          </Button>
          <Button
            component={Link}
            href="/docs"
            variant="text"
            startIcon={<DescriptionIcon />}
            sx={{ textTransform: "none" }}
          >
            Docs & Vault
          </Button>
        </Stack>
      </Paper>

      {/* Cards grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Quick Start */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <RocketLaunchIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Quick Start Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Learn the essentials in 5 minutes: create your first assistant and get productive fast.
            </Typography>
            <Chip label="Beginner" size="small" color="primary" variant="outlined" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/docs" endIcon={<HelpCenterIcon />} sx={{ textTransform: "none" }}>
              Open
            </Button>
          </CardActions>
        </Card>

        {/* Agent Templates Walkthrough */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Agent Template Walkthrough
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step-by-step guide to create powerful AI assistants with examples and best practices.
            </Typography>
            <Chip label="Most Popular" size="small" color="secondary" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/agents/templates/create" endIcon={<AutoAwesomeIcon />} sx={{ textTransform: "none" }}>
              Start Building
            </Button>
          </CardActions>
        </Card>

        {/* Monetization Guide */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <MonetizationOnIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Monetization & Success
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Learn how people use AI assistants to automate work and generate income.
            </Typography>
            <Chip label="Business" size="small" color="success" variant="outlined" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/agents/templates/create" endIcon={<MonetizationOnIcon />} sx={{ textTransform: "none" }}>
              View Strategies
            </Button>
          </CardActions>
        </Card>

        {/* User Guide */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <SchoolIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Complete User Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Explore all features: dashboard, agents, social, careers, and premium tools.
            </Typography>
            <Chip label="Comprehensive" size="small" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/docs" endIcon={<ArticleIcon />} sx={{ textTransform: "none" }}>
              Open Guide
            </Button>
          </CardActions>
        </Card>

        {/* Developer & API Docs */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <DescriptionIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Developer & API Docs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Setup, environment, Prisma schema, API routes, and technical architecture.
            </Typography>
            <Chip label="Developers" size="small" variant="outlined" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/api-docs" endIcon={<DescriptionIcon />} sx={{ textTransform: "none" }}>
              Open API Docs
            </Button>
          </CardActions>
        </Card>

        {/* All Documents */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <HelpCenterIcon color="primary" />
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              All Documents & Vault
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Browse, search, and manage all documents in one place.
            </Typography>
            <Chip label="Docs" size="small" />
          </CardContent>
          <CardActions>
            <Button component={Link} href="/docs" endIcon={<HelpCenterIcon />} sx={{ textTransform: "none" }}>
              Open Docs & Vault
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}

