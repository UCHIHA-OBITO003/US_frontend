import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiMusic, FiUser, FiSmile, FiX, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const CompatibilityScore = ({ partnerId, partnerName, isOpen, onClose }) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && partnerId) {
      fetchScore();
    }
  }, [isOpen, partnerId]);

  const fetchScore = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/compatibility/score/${partnerId}`);
      setScore(response.data.score);
    } catch (error) {
      console.error('Failed to fetch score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return 'from-green-400 to-emerald-500';
    if (scoreValue >= 60) return 'from-blue-400 to-cyan-500';
    if (scoreValue >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-pink-400 to-red-500';
  };

  const getScoreMessage = (scoreValue) => {
    if (scoreValue >= 90) return 'Perfect Match! 💕';
    if (scoreValue >= 80) return 'Great Compatibility! 🌟';
    if (scoreValue >= 70) return 'Very Compatible! ✨';
    if (scoreValue >= 60) return 'Good Match! 😊';
    if (scoreValue >= 50) return 'Decent Compatibility 🤝';
    if (scoreValue >= 30) return 'Some Differences 🤔';
    return 'Opposites Attract! 🌈';
  };

  const getCategoryScore = (category) => {
    if (!score || !score.categories || !score.categories[category]) return 0;
    const { matches, total } = score.categories[category];
    return total > 0 ? Math.round((matches / total) * 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${
          score ? getScoreColor(score.score) : 'from-purple-400 to-pink-400'
        } p-6 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Compatibility Score</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Main Score */}
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="inline-block"
                  >
                    <div className="w-32 h-32 rounded-full bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                      <div className="text-center">
                        <p className="text-5xl font-bold">{score?.score || 0}%</p>
                      </div>
                    </div>
                  </motion.div>
                  <p className="text-xl font-semibold">
                    {getScoreMessage(score?.score || 0)}
                  </p>
                  <p className="text-sm opacity-90 mt-1">
                    with {partnerName}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{score?.totalQuizzes || 0}</p>
                    <p className="text-xs opacity-90">Total Quizzes</p>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{score?.matchedAnswers || 0}</p>
                    <p className="text-xs opacity-90">Matched Answers</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        {!loading && score && score.totalQuizzes > 0 && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-800 mb-4">Category Breakdown</h3>

            {/* Music */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiMusic className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-gray-700">Music</span>
                </div>
                <span className="font-bold text-purple-600">{getCategoryScore('music')}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryScore('music')}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                {score.categories.music.matches} of {score.categories.music.total} matched
              </p>
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">Personality</span>
                </div>
                <span className="font-bold text-blue-600">{getCategoryScore('personality')}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryScore('personality')}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                {score.categories.personality.matches} of {score.categories.personality.total} matched
              </p>
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiSmile className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-700">Preferences</span>
                </div>
                <span className="font-bold text-green-600">{getCategoryScore('preferences')}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryScore('preferences')}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                {score.categories.preferences.matches} of {score.categories.preferences.total} matched
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && score && score.totalQuizzes === 0 && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 mb-2">No quizzes yet!</p>
            <p className="text-sm text-gray-500">
              Start sending quizzes to discover your compatibility with {partnerName}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CompatibilityScore;

