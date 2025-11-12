import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiClock, FiHeart, FiMusic, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CompatibilityQuiz = ({ quiz, onAnswer, onClose, userAnswer, partnerAnswered }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [hasAnswered, setHasAnswered] = useState(!!userAnswer);

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    onAnswer(selectedAnswer);
    setHasAnswered(true);
    toast.success('Answer submitted! ⏳ Waiting for your friend...');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emoji': return '😊';
      case 'song': return '🎵';
      case 'custom': return '💭';
      case 'truth-or-dare': return '🤔';
      case 'would-you-rather': return '🤷';
      case 'never-have-i': return '🙈';
      default: return '❓';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emoji': return 'from-yellow-400 to-orange-400';
      case 'song': return 'from-purple-400 to-pink-400';
      case 'custom': return 'from-blue-400 to-cyan-400';
      default: return 'from-indigo-400 to-purple-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-gradient-to-br ${getTypeColor(quiz.type)} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{getTypeIcon(quiz.type)}</span>
            <div>
              <h3 className="font-bold text-white">Compatibility Quiz</h3>
              <p className="text-xs text-white opacity-80">Answer and see if you match!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Question */}
        <div className="p-6 bg-white bg-opacity-10 backdrop-blur-sm">
          <p className="text-xl font-semibold text-white mb-6 text-center">
            {quiz.question}
          </p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {quiz.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                onClick={() => !hasAnswered && setSelectedAnswer(option)}
                disabled={hasAnswered}
                className={`w-full p-4 rounded-2xl transition-all text-left flex items-center justify-between ${
                  selectedAnswer === option
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-semibold">{option}</span>
                {selectedAnswer === option && (
                  <FiCheck className="w-5 h-5" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Status */}
          {!hasAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <FiClock className="w-5 h-5 text-white animate-pulse" />
                <p className="text-white font-semibold">
                  {partnerAnswered ? 'Both answered! Revealing...' : 'Waiting for your friend...'}
                </p>
              </div>
              <div className="flex justify-center space-x-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm p-3 text-center text-xs text-white opacity-80">
          Created by {quiz.creator?.displayName || 'Friend'}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompatibilityQuiz;

