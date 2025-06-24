import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { User } from "@/types"

export function useUser() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (session?.user?.id) {
      fetchUserData(session.user.id)
    } else {
      setLoading(false)
    }
  }, [session, status])

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/user/profile?id=${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const response = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        return updatedUser
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  return {
    user,
    loading,
    updateUser,
    isAuthenticated: !!session,
    isPremium: user?.subscriptionStatus === "premium"
  }
}