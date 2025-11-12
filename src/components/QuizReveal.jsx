import { motion } from 'framer-motion';
import { FiCheck, FiX, FiHeart } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const QuizReveal = ({ quiz, matched, onClose }) => {
  useEffect(() => {
    if (matched) {
      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB6D9', '#A066FF', '#6B46C1', '#FFD700']
      });
    }
  }, [matched]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, rotate: 10 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-gradient-to-br ${
          matched
            ? 'from-green-400 via-emerald-400 to-teal-400'
            : 'from-orange-400 via-red-400 to-pink-400'
        } rounded-3xl shadow-2xl w-full max-w-md p-8 text-white text-center overflow-hidden relative`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            {matched ? (
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center">
                <FiHeart className="w-12 h-12 text-green-500 fill-current" />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center">
                <FiX className="w-12 h-12 text-red-500" />
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-4"
          >
            {matched ? "It's a Match! 🎉" : "Different Answers 🤷"}
          </motion.h2>

          {/* Question */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg mb-6 opacity-90"
          >
            {quiz.question}
          </motion.p>

          {/* Answers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            {quiz.answers.map((answer, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-30 backdrop-blur-sm rounded-2xl p-4"
              >
                <p className="text-sm font-semibold mb-1">
                  {answer.user.displayName}
                </p>
                <p className="text-xl font-bold">{answer.answer}</p>
              </div>
            ))}
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm opacity-80 mb-6"
          >
            {matched
              ? "You two are on the same wavelength! 🌟"
              : "Interesting! Different perspectives make things fun! 💫"}
          </motion.p>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="px-8 py-3 bg-white text-gray-800 rounded-full font-bold hover:shadow-lg transition-all"
          >
            Got it!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizReveal;

