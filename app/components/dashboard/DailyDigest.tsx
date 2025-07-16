"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Digest {
  content: string;
  lastUpdated: string;
}

export const DigestSkeleton = () => (
  <div className="bg-gray-800/50 p-6 rounded-2xl animate-pulse">
    <div className="h-5 bg-gray-700 rounded w-1/3 mb-6"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export default function DailyDigest() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        const response = await fetch('/api/digest');
        if (!response.ok) {
          throw new Error('Could not fetch the daily digest.');
        }
        const data = await response.json();
        setDigest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDigest();
  }, []);

  if (isLoading) {
    return <DigestSkeleton />;
  }
  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-6 rounded-2xl">
        <h3 className="font-bold mb-2">Error Loading Digest</h3>
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4">
        AI Daily Digest
      </h2>
      {digest ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{digest.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-400">No digest available for today.</p>
      )}
    </div>
  );
} 