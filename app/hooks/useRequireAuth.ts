import { useUser } from '../../src/hooks/useUser';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Hook to require authentication on a page. Redirects to /auth/signin if not logged in.
 * Returns { user, isLoading } from useUser().
 */
export function useRequireAuth() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, isLoading, router]);
  return { user, isLoading };
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
