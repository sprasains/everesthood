"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser"; // Assuming this hook is correctly set up
import PersonaSelector from "@/components/ui/PersonaSelector";
import StreakDisplay from "@/components/ui/StreakDisplay";
import Navbar from "@/components/layout/Navbar";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BarChartIcon from "@mui/icons-material/BarChart";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="bg-gray-800/50 rounded-2xl p-8 mb-8 flex items-center space-x-6">
      <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="flex space-x-6 pt-2">
          <div className="h-10 bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
    <div className="h-16 bg-gray-800/50 rounded-lg mb-8"></div>
    <div className="h-64 bg-gray-800/50 rounded-lg"></div>
  </div>
);

export default function ProfilePage() {
  const { user, updateUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    weeklyGoal: 5,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        weeklyGoal: user.weeklyGoal || 5,
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateUser(formData);
    setIsEditing(false);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: <BarChartIcon /> },
    { id: "persona", name: "AI Persona", icon: <PersonIcon /> },
    { id: "achievements", name: "Achievements", icon: <EmojiEventsIcon /> },
    { id: "settings", name: "Settings", icon: <SettingsIcon /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="pt-20 px-6 pb-6">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  // Fix type error for getPersonaIcon
  const getPersonaIcon = (persona: string | undefined) => {
    switch (persona) {
      case "ZenGPT":
        return "🧘‍♀️";
      case "HustleBot":
        return "🔥";
      case "DataDaddy":
        return "📊";
      default:
        return "💪";
    }
  };

  // Fix property error for createdAt
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-purple-900/20 border border-purple-500/20"
          >
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-28 h-28 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-5xl shadow-lg"
              >
                {getPersonaIcon(user?.persona)}
              </motion.div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {user?.name || "AI Explorer"}
                </h1>
                <p className="text-gray-400 mb-4 text-lg">
                  Level {user?.level || 1} • {user?.persona || "Not Selected"} •
                  Member since {memberSince}
                </p>
                <div className="flex justify-center sm:justify-start space-x-6">
                  <div>
                    <div className="text-3xl font-bold">{user?.xp || 0}</div>
                    <div className="text-gray-500 text-sm">Total XP</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {user?.streak || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {user?.articlesRead || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Articles Read</div>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-colors font-semibold shadow-md"
              >
                Edit Profile
              </motion.button>
            </div>
          </motion.div>

          {/* Animated Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Name", value: user?.name || "AI Explorer" },
              { label: "Level", value: user?.level || 1 },
              { label: "Persona", value: user?.persona || "Not Selected" },
              { label: "Member Since", value: memberSince },
              { label: "XP", value: user?.xp || 0 },
              { label: "Streak", value: user?.streak || 0 },
              { label: "Articles Read", value: user?.articlesRead || 0 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg text-center"
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {stat.label}
                </h3>
                <p className="text-3xl font-semibold text-purple-400">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-8 bg-gray-800/60 rounded-xl p-2 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 py-3 px-4 rounded-lg transition-colors relative ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="z-10">{tab.icon}</span>
                <span className="z-10 font-medium tracking-wide">
                  {tab.name}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StreakDisplay />
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Learning Stats
                    </h3>
                    {/* ... content for learning stats ... */}
                  </div>
                </div>
              )}

              {activeTab === "persona" && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <PersonaSelector />
                </div>
              )}

              {activeTab === "achievements" && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Your Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* ... achievements grid ... */}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Account Settings
                  </h3>
                  {/* ... settings form ... */}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Edit Profile
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Weekly Goal
                    </label>
                    <input
                      type="number"
                      value={formData.weeklyGoal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weeklyGoal: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 mt-8">
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/40 py-2.5 rounded-lg text-white font-semibold transition"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg text-white font-medium transition"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
