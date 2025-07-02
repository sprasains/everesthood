"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useSnackbar } from 'notistack';

const MOTIVATIONAL_MESSAGES = [
  "You're doing amazing! Keep it up!",
  "Every small step counts!",
  "Digital freedom is within reach!",
  "Stay strong, you're building a better habit!",
  "One day at a time!",
  "Your mind will thank you!",
  "You're on a roll!",
];

function getRandomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

function calculateStreak(tasks: Task[], progress: string[]): number {
  // Streak: consecutive days with at least one completed task
  const days = [...new Set(tasks.map((t: Task) => t.day))].sort((a: number, b: number) => a - b);
  let streak = 0;
  for (const day of days) {
    const dayTasks = tasks.filter((t: Task) => t.day === day);
    if (dayTasks.some((t: Task) => progress.includes(t.id))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

interface Task {
  id: string;
  day: number;
  title: string;
  content: string;
  order: number;
}
interface Plan {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: string;
  tasks: Task[];
}
interface Achievement {
  name: string;
  icon: string;
}

export default function DigitalZenPlanPage() {
  const params = useParams();
  const planId = Array.isArray(params?.planId) ? params.planId[0] : params?.planId;
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<Achievement[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!planId || !user?.id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/digital-zen/plans/${planId}`).then((res) => res.json()),
      fetch(`/api/digital-zen/progress/${planId}`).then((res) => res.json()),
      fetch(`/api/v1/user/achievements?userId=${user.id}`).then((res) => res.json()),
    ]).then(([planData, progressData, badges]) => {
      setPlan(planData);
      setProgress(Array.isArray(progressData) ? progressData : progressData.progress);
      setEarnedBadges(badges);
      setLoading(false);
    });
  }, [planId, user?.id]);

  const tasksByDay = plan?.tasks.reduce((acc, task) => {
    acc[task.day] = acc[task.day] || [];
    acc[task.day].push(task);
    return acc;
  }, {} as Record<number, Task[]>) || {};

  const totalTasks = plan?.tasks.length || 0;
  const completedTasks = progress.length;
  const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak = useMemo(() => plan ? calculateStreak(plan.tasks, progress) : 0, [plan, progress]);
  const allComplete = totalTasks > 0 && completedTasks === totalTasks;

  async function handleToggle(taskId: string, checked: boolean) {
    setSaving(true);
    const res = await fetch(`/api/digital-zen/progress/${planId}`, {
      method: checked ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    const data = await res.json();
    setProgress(Array.isArray(data) ? data : data.progress);
    setSaving(false);
    setMotivation(getRandomMessage());
    if (plan && (Array.isArray(data) ? data.length : data.progress.length) === plan.tasks.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    // Show badge modal if new achievements
    if (data.newAchievements && data.newAchievements.length > 0) {
      setShowBadgeModal(data.newAchievements[0]);
      setEarnedBadges((prev) => [...prev, ...data.newAchievements]);
      setTimeout(() => setShowBadgeModal(null), 3500);
      // In-app notification
      enqueueSnackbar(`Achievement unlocked: ${data.newAchievements[0].name}!`, { variant: 'success' });
      // Push notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Achievement Unlocked!', {
            body: `${data.newAchievements[0].icon} ${data.newAchievements[0].name}`,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    }
    // Streak notification (in-app and push)
    if (plan) {
      const streakNow = calculateStreak(plan.tasks, Array.isArray(data) ? data : data.progress);
      if (streakNow > 0 && streakNow % 2 === 0) {
        enqueueSnackbar(`🔥 Streak: ${streakNow} days!`, { variant: 'info' });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Streak Milestone!', {
            body: `🔥 ${streakNow} days in a row! Keep it up!`,
          });
        }
      }
    }
  }

  useEffect(() => {
    // Prompt for notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/digital-zen" className="inline-block mb-6 text-blue-600 hover:underline text-sm">← Back to all plans</Link>
      {loading || !plan ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
              {earnedBadges.map((badge) => (
                <span key={badge.name} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold shadow">
                  <span className="text-lg">{badge.icon}</span> {badge.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-center">
            <img src={plan.coverImage} alt={plan.title} className="rounded-lg w-full sm:w-64 h-40 object-cover" />
            <div>
              <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
              <p className="text-gray-600 mb-2">{plan.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <motion.div
                  className="bg-blue-500 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.7 }}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{completedTasks} of {totalTasks} tasks completed ({percent}%)</div>
              <div className="text-xs text-green-600 mt-1 font-semibold">🔥 Streak: {streak} day{streak === 1 ? "" : "s"}</div>
            </div>
          </div>
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
              >
                <Confetti />
              </motion.div>
            )}
            {showBadgeModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              >
                <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                  <span className="text-5xl mb-2 animate-bounce">{showBadgeModal.icon}</span>
                  <div className="text-xl font-bold mb-1">Achievement Unlocked!</div>
                  <div className="text-lg font-semibold text-yellow-700">{showBadgeModal.name}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {motivation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-6 text-center text-lg font-semibold text-blue-600"
            >
              {motivation}
            </motion.div>
          )}
          <div className="space-y-8">
            {Object.keys(tasksByDay).sort((a, b) => Number(a) - Number(b)).map((day) => (
              <div key={day}>
                <h2 className="text-xl font-semibold mb-4">Day {day}</h2>
                <div className="space-y-4">
                  {tasksByDay[Number(day)].map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 bg-white rounded-lg shadow p-4"
                    >
                      <input
                        type="checkbox"
                        checked={progress.includes(task.id)}
                        disabled={saving}
                        onChange={(e) => handleToggle(task.id, e.target.checked)}
                        className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-gray-600 text-sm">{task.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-8 text-center text-2xl font-bold text-green-600"
            >
              🎉 Congratulations! You completed the plan! 🎉
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// Simple confetti effect
function Confetti() {
  const colors = ["#60a5fa", "#fbbf24", "#34d399", "#f472b6", "#a78bfa", "#f87171"];
  return (
    <div className="w-full h-full flex flex-wrap items-center justify-center">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            top: "50%",
            left: "50%",
            opacity: 1,
            scale: 1,
            rotate: Math.random() * 360,
          }}
          animate={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            scale: 0.7 + Math.random() * 0.6,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 2.5 + Math.random() * 1.5, ease: "easeOut" }}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: colors[i % colors.length],
            zIndex: 100,
          }}
        />
      ))}
    </div>
  );
} 