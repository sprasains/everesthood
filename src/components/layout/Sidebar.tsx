"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/hooks/useUser"

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  const menuItems = [
    { 
      icon: "🏠", 
      label: "Dashboard", 
      href: "/dashboard",
      description: "Your AI journey overview"
    },
    { 
      icon: "📰", 
      label: "News Feed", 
      href: "/news",
      description: "Latest AI & tech updates"
    },
    { 
      icon: "🤖", 
      label: "AI Summaries", 
      href: "/summaries",
      description: "Your personalized insights"
    },
    { 
      icon: "🏆", 
      label: "Achievements", 
      href: "/achievements",
      description: "Track your progress"
    },
    { 
      icon: "👥", 
      label: "Community", 
      href: "/community",
      description: "Connect with other learners"
    },
    { 
      icon: "⚙️", 
      label: "Settings", 
      href: "/settings",
      description: "Customize your experience"
    },
    { 
      icon: "🔑", 
      label: "Creator API", 
      href: "/settings/api",
      description: "Manage your API keys"
    },
    {
      icon: "📄",
      label: "Resume Vibe Check",
      href: "/tools/resume-checker",
      description: "AI-powered resume feedback"
    }
  ]

  return (
    <motion.aside
      data-testid="sidebar"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-700 z-30 overflow-y-auto"
    >
      <div className="p-6">
        {/* User Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{user.persona === "ZenGPT" ? "🧘‍♀️" : user.persona === "HustleBot" ? "🔥" : user.persona === "DataDaddy" ? "📊" : "💪"}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{user.name || "AI Explorer"}</h3>
                <p className="text-white/80 text-sm">Level {user.level ?? 1}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-white/80 text-xs mb-1">
                <span>{user.xp ?? 0} XP</span>
                <span>{(user.level ?? 1) * 100} XP</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(((user.xp ?? 0) % 100) / 100) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-purple-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Premium Upgrade CTA */}
        {user?.subscriptionStatus === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-4"
          >
            <h3 className="text-white font-semibold mb-2">🚀 Unlock Premium</h3>
            <p className="text-white/80 text-sm mb-3">
              Get unlimited AI summaries, exclusive personas, and advanced features
            </p>
            <Link
              href="/subscribe"
              className="block w-full bg-white text-purple-600 text-center py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </Link>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}