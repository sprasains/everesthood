"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { moodContent } from "./moodContent";
import { useSession } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import clsx from "clsx";
import BreatheThruSession from './BreatheThruSession';

const moods = [
  { key: "GREAT", emoji: "😄", label: "Great" },
  { key: "GOOD", emoji: "🙂", label: "Good" },
  { key: "MEH", emoji: "😐", label: "Meh" },
  { key: "BAD", emoji: "😔", label: "Bad" },
  { key: "AWFUL", emoji: "😭", label: "Awful" }
];

export default function MoodTracker() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [supportMsg, setSupportMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState<any>(null);
  const [showBreatheThruSession, setShowBreatheThruSession] = useState(false);
  const [lastLoggedMood, setLastLoggedMood] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/mood/today")
      .then(res => res.json())
      .then(data => {
        if (data && data.mood) {
          setTodayMood(data);
          setSupportMsg(randomMsg(data.mood));
        }
        setLoading(false);
      });
  }, [session?.user]);

  function randomMsg(mood: string) {
    const arr = moodContent[mood];
    return arr ? arr[Math.floor(Math.random() * arr.length)] : "";
  }

  const handleSelect = async (mood: string) => {
    setSelected(mood);
    setTimeout(() => setSubmitted(true), 500);
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood })
    });
    if (res.ok) {
      setSupportMsg(randomMsg(mood));
      setTodayMood({ mood });
      setLastLoggedMood(mood);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-32"><CircularProgress /></div>;

  return (
    <div className="max-w-md mx-auto p-2 flex flex-col items-center">
      <AnimatePresence>
        {!todayMood && !submitted && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="text-xs text-white text-center mb-1">Mood Tracker</div>
            <div className="flex justify-between gap-1">
              {moods.map((m, i) => (
                <motion.button
                  key={m.key}
                  whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    "text-2xl p-1 rounded-full border-2 transition-all bg-white/80",
                    selected === m.key
                      ? "border-blue-500 bg-blue-100"
                      : "border-transparent"
                  )}
                  onClick={() => handleSelect(m.key)}
                  aria-label={m.label}
                  disabled={!!selected}
                >
                  <span role="img" aria-label={m.label}>{m.emoji}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {(todayMood || submitted) && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-xs text-white text-center mb-1">Mood Tracker</div>
            <div className="my-1">
              <span className="text-2xl">
                {todayMood
                  ? moods.find(m => m.key === todayMood.mood)?.emoji
                  : moods.find(m => m.key === selected)?.emoji}
              </span>
              <span className="ml-1 text-base font-semibold">
                {todayMood
                  ? moods.find(m => m.key === todayMood.mood)?.label
                  : moods.find(m => m.key === selected)?.label}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-center text-xs text-blue-100"
            >
              {supportMsg}
            </motion.div>
            {lastLoggedMood && ['MEH', 'BAD', 'AWFUL'].includes(lastLoggedMood) && !showBreatheThruSession && (
              <button
                className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                onClick={() => setShowBreatheThruSession(true)}
              >
                Take a mindful moment
              </button>
            )}
            {showBreatheThruSession && (
              <BreatheThruSession onClose={() => setShowBreatheThruSession(false)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 