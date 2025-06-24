import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

type SessionUserWithId = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
};

type SessionWithUserId = {
  user?: SessionUserWithId;
};

export function useUser() {
  const { data: session, status } = useSession() as {
    data: SessionWithUserId | null;
    status: string;
  };
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      fetchUserData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session, status]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/user/profile?id=${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const response = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return {
    user,
    loading,
    updateUser,
    isAuthenticated: !!session,
    isPremium: user?.subscriptionStatus === "premium",
  };
}

export interface User {
  /** Unique identifier for the user */
  id: string;

  /** Display name of the user */
  name?: string;

  /** Email address of the user */
  email?: string;

  /** Selected AI persona */
  persona?: string;

  /** Current level of the user */
  level?: number;

  /** Total experience points accumulated */
  xp?: number;

  /** Current streak count */
  streak?: number;

  /** Number of articles read by the user */
  articlesRead?: number;

  /** Number of AI summaries used */
  summariesUsed?: number;

  /** Subscription status (e.g., free, premium) */
  subscriptionStatus?: string;

  /** Account creation date */
  createdAt?: Date;

  /** Weekly goal set by the user */
  weeklyGoal?: number;
}
