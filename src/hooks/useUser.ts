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

    if (session && session.user && session.user.id) {
      // Immediately set a minimal user object from session for instant UI feedback
      setUser((prev) =>
        prev || {
          id: session.user!.id as string,
          name: session.user!.name || undefined,
          email: session.user!.email || undefined,
          image: session.user!.image || undefined,
          xp: 0,
          level: 0,
          streak: 0,
          persona: '',
          dailyProgress: 0,
          weeklyGoal: 0,
          achievements: [],
          friends: [],
          publicProfile: true,
          articlesRead: 0,
          sharesCount: 0,
        }
      );
      fetchUserData(session.user.id);
    } else {
      setUser(null);
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
    isPremium: user?.subscriptionTier === "PREMIUM",
  };
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  coverPicture?: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  persona: string;
  dailyProgress: number;
  weeklyGoal: number;
  achievements: string[];
  friends: string[];
  publicProfile: boolean;
  articlesRead: number;
  sharesCount: number;
  createdAt?: string;
  subscriptionTier?: string;
}
