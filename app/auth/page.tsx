"use client";
export const dynamic = "force-dynamic";
// /app/auth/page.tsx
// Auth page hosting the AuthForm component, centered layout

import AuthForm from "@/components/ui/AuthForm";

export default function AuthPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <AuthForm />
    </main>
  );
}
