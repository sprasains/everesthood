"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreatheThruSessionProps {
  onClose: () => void;
}

type Phase = 'Get Ready' | 'Inhale' | 'Hold' | 'Exhale' | 'Done';

export const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: 'Get Ready', duration: 2, label: 'Get Ready...' },
  { phase: 'Inhale', duration: 4, label: 'Breathe In' },
  { phase: 'Hold', duration: 4, label: 'Hold' },
  { phase: 'Exhale', duration: 6, label: 'Breathe Out' },
];

export default function BreatheThruSession({ onClose }: BreatheThruSessionProps) {
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [phase, setPhase] = useState<Phase>('Get Ready');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!started) return;
    setPhase(PHASES[phaseIndex].phase);
    setCountdown(PHASES[phaseIndex].duration);
    timerRef.current = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [started, phaseIndex]);

  useEffect(() => {
    if (!started) return;
    if (countdown < 0) return;
    if (countdown === 0) {
      if (phaseIndex < PHASES.length - 1) {
        setPhaseIndex((i) => i + 1);
      } else {
        setPhase('Done');
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
    // eslint-disable-next-line
  }, [countdown, started, phaseIndex]);

  // Animation values for the circle
  const getCircleSize = () => {
    switch (phase) {
      case 'Inhale':
        return 220;
      case 'Hold':
        return 220;
      case 'Exhale':
        return 100;
      default:
        return 100;
    }
  };

  // Animation color for the circle
  const getCircleColor = () => {
    switch (phase) {
      case 'Inhale':
        return 'bg-blue-200';
      case 'Hold':
        return 'bg-blue-100';
      case 'Exhale':
        return 'bg-blue-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex flex-col items-center justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Animated Breathing Circle */}
          <motion.div
            className={`flex items-center justify-center rounded-full shadow-xl ${getCircleColor()}`}
            style={{ width: getCircleSize(), height: getCircleSize() }}
            animate={{
              width: getCircleSize(),
              height: getCircleSize(),
            }}
            transition={{
              duration: phase === 'Inhale' || phase === 'Exhale' ? 4 : 0.5,
              ease: 'easeInOut',
            }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-xl md:text-2xl font-semibold text-blue-900 select-none">
                {phase === 'Done' ? 'Session Complete' : PHASES[phaseIndex]?.label}
              </span>
              {phase !== 'Done' && (
                <span className="text-3xl md:text-4xl font-bold text-blue-700 mt-2 select-none">
                  {countdown > 0 ? countdown : ''}
                </span>
              )}
            </div>
          </motion.div>
          {/* Controls */}
          <div className="flex flex-col items-center mt-8 w-full">
            {!started ? (
              <button
                className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
                onClick={() => setStarted(true)}
              >
                Start
              </button>
            ) : (
              <button
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition mt-2"
                onClick={onClose}
              >
                End Session
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 