"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import PollCard from "@/components/ui/PollCard"
import { logger, newCorrelationId, getCorrelationId } from '@/services/logger'
import PostCard, { PostCardSkeleton } from './PostCard';
import { Post, User } from "@prisma/client";

// Import the PostWithDetails type from PostCard
type PostWithDetails = Post & {
  author: Partial<User>;
  likeCount?: number;
  viewCount?: number;
  commentCount?: number;
  commentsJson?: any[];
  isLiked?: boolean;
};

interface SocialFeedProps {
  posts?: PostWithDetails[];
  loading?: boolean;
  error?: any;
}

export default function SocialFeed({ posts = [], loading = false, error = null }: SocialFeedProps) {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [polls, setPolls] = useState([]);

  // Add post type selection and metadata UI
  const [postType, setPostType] = useState<'TEXT' | 'POLL' | 'LINK' | 'PREDICTION'>('TEXT');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [linkUrl, setLinkUrl] = useState('');
  const [prediction, setPrediction] = useState('');

  // Remove internal fetching of posts for the main feed

  const handlePost = async () => {
    if (postType === 'TEXT' && !postText.trim()) return;
    if (postType === 'POLL' && pollOptions.filter(opt => opt.trim()).length < 2) return;
    if (postType === 'LINK' && !linkUrl.trim()) return;
    if (postType === 'PREDICTION' && !prediction.trim()) return;

    let metadata: any = {};
    if (postType === 'POLL') metadata.options = pollOptions.filter(opt => opt.trim());
    if (postType === 'LINK') metadata.url = linkUrl;
    if (postType === 'PREDICTION') metadata.prediction = prediction;

    newCorrelationId();
    logger.info('Posting to social feed.', { postType, metadata });
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': getCorrelationId() },
        body: JSON.stringify({
          content: postType === 'TEXT' ? postText : '',
          type: postType,
          metadata,
        }),
      });
      if (res.ok) {
        logger.info('Post successful.');
        setPostText('');
        setPollOptions(['', '']);
        setLinkUrl('');
        setPrediction('');
        setPostType('TEXT');
      } else {
        logger.warn('Failed to post to social feed.', { status: res.status });
      }
    } catch (error: any) {
      logger.error('Error posting to social feed.', { error: error.message, stack: error.stack });
    }
  }

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "Alex Chen", xp: 1247, avatar: "🦄" },
    { rank: 2, name: "Sam Rivera", xp: 1156, avatar: "🚀" },
    { rank: 3, name: "Jordan Kim", xp: 1089, avatar: "⚡" },
    { rank: 4, name: user?.name || "You", xp: user?.xp || 0, avatar: "🌟" },
  ]

  return (
    <div className="space-y-6" data-testid="social-feed">
      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
            🌟
          </div>
          <div className="flex-1">
            <textarea 
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={`What's your AI insight today, ${user?.name || 'friend'}?`}
              className="w-full bg-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none border-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <button className={`text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1 ${postType === 'POLL' ? 'font-bold underline' : ''}`} onClick={() => setPostType('POLL')}>
                  <span>📊</span>
                  <span>Poll</span>
                </button>
                <button className={`text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 ${postType === 'LINK' ? 'font-bold underline' : ''}`} onClick={() => setPostType('LINK')}>
                  <span>🔗</span>
                  <span>Link</span>
                </button>
                <button className={`text-green-400 hover:text-green-300 text-sm flex items-center space-x-1 ${postType === 'PREDICTION' ? 'font-bold underline' : ''}`} onClick={() => setPostType('PREDICTION')}>
                  <span>💡</span>
                  <span>Prediction</span>
                </button>
                <button className={`text-gray-400 hover:text-white text-sm flex items-center space-x-1 ${postType === 'TEXT' ? 'font-bold underline' : ''}`} onClick={() => setPostType('TEXT')}>
                  <span>📝</span>
                  <span>Text</span>
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePost}
                disabled={!postText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Share +25 XP
              </motion.button>
            </div>

            {/* Post type specific UI */}
            {postType === 'POLL' && (
              <div className="mt-2 space-y-2">
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    value={opt}
                    onChange={e => setPollOptions(opts => opts.map((o, i) => i === idx ? e.target.value : o))}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
                  />
                ))}
                <button type="button" className="text-xs text-purple-300 mt-1" onClick={() => setPollOptions(opts => [...opts, ''])}>+ Add Option</button>
              </div>
            )}
            {postType === 'LINK' && (
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="Paste a link (https://...)"
                className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 mt-2"
              />
            )}
            {postType === 'PREDICTION' && (
              <input
                value={prediction}
                onChange={e => setPrediction(e.target.value)}
                placeholder="Your prediction..."
                className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 mt-2"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          🏆 Weekly Leaders
          <span className="ml-2 text-sm text-gray-400 font-normal">Your rank: #{leaderboard.findIndex(l => l.name === user?.name) + 1 || 4}</span>
        </h3>

        <div className="space-y-3">
          {leaderboard.map((leader) => (
            <motion.div
              key={leader.rank}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                leader.name === user?.name ? 'bg-purple-600/20 border border-purple-500' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : leader.rank === 3 ? '🥉' : '⭐'}
                </span>
                <span className="text-2xl">{leader.avatar}</span>
                <div>
                  <span className="font-medium text-white">{leader.name}</span>
                  {leader.name === user?.name && (
                    <span className="ml-2 text-xs text-purple-400">(You)</span>
                  )}
                </div>
              </div>
              <span className="text-purple-400 font-bold">{leader.xp} XP</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            🎯 Compete with friends • Share insights • Climb the ranks
          </p>
        </div>
      </motion.div>

      {/* Community Highlights */}
      {polls.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">🗳️ Weekly Vibe Check</h3>
          <PollCard pollData={polls[0]} />
        </motion.div>
      )}
      {/* Main Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">📰 Latest Posts</h3>
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4"><PostCardSkeleton /></div>
            ))}
          </>
        ) : error ? (
          <div className="text-red-400">Error loading posts.</div>
        ) : posts && posts.length > 0 ? (
          posts.map((post, idx) => (
            <div key={post.id || idx} className="mb-4">
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="text-gray-400">No posts yet. Be the first to share something!</div>
        )}
      </motion.div>
      {/* ... existing community highlights, etc ... */}
    </div>
  )
}