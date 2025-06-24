"use client"
import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useUser } from "@/hooks/useUser"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const { user } = useUser()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur border-b border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">E</span>
            </motion.div>
            <span className="text-white font-bold text-xl">Everhood</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
              📰 News
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              🏠 Dashboard
            </Link>
            {user?.subscriptionStatus === "free" && (
              <Link 
                href="/subscribe" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg transition-all"
              >
                ⚡ Upgrade
              </Link>
            )}
          </div>

          {/* User Menu */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 text-sm focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  {/* XP and Level */}
                  <div className="hidden sm:block text-right">
                    <div className="text-purple-400 font-bold text-xs">Level {user?.level || 1}</div>
                    <div className="text-gray-400 text-xs">{user?.xp || 0} XP</div>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm">
                        {session.user?.name?.[0] || '?'}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2"
                >
                  <Link 
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    👤 Profile
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    📊 Dashboard
                  </Link>
                  {user?.subscriptionStatus === "premium" ? (
                    <Link 
                      href="/billing"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      💳 Billing
                    </Link>
                  ) : (
                    <Link 
                      href="/subscribe"
                      className="block px-4 py-2 text-sm text-purple-400 hover:bg-gray-700 hover:text-purple-300"
                    >
                      ⚡ Upgrade to Premium
                    </Link>
                  )}
                  <hr className="my-2 border-gray-700" />
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    🚪 Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-white font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}