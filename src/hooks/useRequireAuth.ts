import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Hook to require authentication on a page. Redirects to /auth/signin if not logged in.
 * Returns { user, loading } from useUser().
 */
export function useRequireAuth() {
  const { user, loading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);
  return { user, loading };
}

/**
 * Component to show a loading spinner while auth is being checked.
 */
import React from "react";
export function AuthLoading() {
  return React.createElement('div', { style: { marginTop: 64, display: 'flex', justifyContent: 'center' } },
    React.createElement(CircularProgress, null)
  );
}
