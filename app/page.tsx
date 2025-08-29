// Duplicate cleanup: merged from src/app/page.tsx, app/page.tsx on 2025-08-20
"use client";
export const dynamic = "force-dynamic";
import AuthForm from "@/components/ui/AuthForm";
import { Box } from "@mui/material";
import Image from "next/image";
import AppLayoutShell from '@/components/layout/AppLayoutShell';

// This page is now a landing page. Auth is handled in /auth/signin and /auth/signup
export default function AuthLandingPage() {
  return (
    <AppLayoutShell>
      <AuthForm />
    </AppLayoutShell>
  );
}
