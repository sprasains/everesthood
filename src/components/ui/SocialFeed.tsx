"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import PollCard from "@/components/ui/PollCard"

export default function SocialFeed() {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [polls, setPolls] = useState([]);

  // Add post type selection and metadata UI
  const [postType, setPostType] = useState<'TEXT' | 'POLL' | 'LINK' | 'PREDICTION'>('TEXT');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [linkUrl, setLinkUrl] = useState('');
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    // Fetch polls from API
    const fetchPolls = async () => {
      const res = await fetch("/api/v1/polls");
      if (res.ok) {
        setPolls(await res.json());
      }
    };
    fetchPolls();
  }, []);

  const handlePost = async () => {
    if (postType === 'TEXT' && !postText.trim()) return;
    if (postType === 'POLL' && pollOptions.filter(opt => opt.trim()).length < 2) return;
    if (postType === 'LINK' && !linkUrl.trim()) return;
    if (postType === 'PREDICTION' && !prediction.trim()) return;

    let metadata: any = {};
    if (postType === 'POLL') metadata.options = pollOptions.filter(opt => opt.trim());
    if (postType === 'LINK') metadata.url = linkUrl;
    if (postType === 'PREDICTION') metadata.prediction = prediction;

    const res = await fetch('/api/v1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: postType === 'TEXT' ? postText : '',
        type: postType,
        metadata,
      }),
    });
    if (res.ok) {
      setPostText('');
      setPollOptions(['', '']);
      setLinkUrl('');
      setPrediction('');
      setPostType('TEXT');
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">💬 Community Highlights</h3>

        <div className="space-y-4">
          {[
            { user: "TechWiz", content: "Just discovered this insane AI breakthrough! 🤯", likes: 23, time: "2h" },
            { user: "CultureCritic", content: "Gen-Z is literally reshaping the entire fashion industry", likes: 18, time: "4h" },
            { user: "FutureBuilder", content: "Working on my startup pitch for tomorrow 🚀", likes: 31, time: "6h" }
          ].map((post, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                  {post.user[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white text-sm">{post.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-300">{post.content}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="text-xs text-gray-400 hover:text-pink-400 flex items-center space-x-1">
                      <span>💖</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="text-xs text-gray-400 hover:text-blue-400">
                      💬 Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}