import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiRefreshCw, FiSend } from 'react-icons/fi';

const MiniGames = ({ isOpen, onClose, onSendQuestion }) => {
  const [currentGame, setCurrentGame] = useState('menu'); // menu, truth-or-dare, would-you-rather, never-have-i

  // Truth or Dare
  const [truthOrDare, setTruthOrDare] = useState('');
  
  const truths = [
    "What's your biggest fear?",
    "What's the most embarrassing thing you've done?",
    "Who was your first crush?",
    "What's a secret you've never told anyone?",
    "What's your biggest regret?",
    "What's the weirdest dream you've ever had?",
    "What's something you're ashamed of?",
    "Who do you have a crush on right now?",
    "What's the biggest lie you've ever told?",
    "What's your guilty pleasure?",
  ];

  const dares = [
    "Do 20 push-ups right now",
    "Post an embarrassing photo on social media",
    "Text your crush 'I like you'",
    "Eat a spoonful of hot sauce",
    "Dance with no music for 1 minute",
    "Call a random contact and sing to them",
    "Do your best celebrity impression",
    "Speak in an accent for the next 10 minutes",
    "Let someone else read your last 5 text messages",
    "Post a story saying 'I'm bored, someone entertain me'",
  ];

  const generateTruthOrDare = (type) => {
    const list = type === 'truth' ? truths : dares;
    const random = list[Math.floor(Math.random() * list.length)];
    setTruthOrDare(random);
  };

  // Would You Rather
  const [wouldYouRather, setWouldYouRather] = useState(null);
  
  const wouldYouRatherQuestions = [
    { option1: "Have the ability to fly", option2: "Be invisible" },
    { option1: "Live without music", option2: "Live without movies" },
    { option1: "Be able to speak all languages", option2: "Talk to animals" },
    { option1: "Time travel to the past", option2: "Time travel to the future" },
    { option1: "Have unlimited money", option2: "Have unlimited free time" },
    { option1: "Never use social media again", option2: "Never watch TV/movies again" },
    { option1: "Be famous but poor", option2: "Be rich but unknown" },
    { option1: "Live in the city", option2: "Live in the countryside" },
    { option1: "Always say what you think", option2: "Never speak again" },
    { option1: "Have a rewind button", option2: "Have a pause button for your life" },
  ];

  const generateWouldYouRather = () => {
    const random = wouldYouRatherQuestions[Math.floor(Math.random() * wouldYouRatherQuestions.length)];
    setWouldYouRather(random);
  };

  // Never Have I Ever
  const [neverHaveI, setNeverHaveI] = useState('');
  
  const neverHaveIStatements = [
    "Never have I ever been in love",
    "Never have I ever cheated on a test",
    "Never have I ever lied to my parents",
    "Never have I ever had a one-night stand",
    "Never have I ever been arrested",
    "Never have I ever ghosted someone",
    "Never have I ever stalked an ex on social media",
    "Never have I ever broken a bone",
    "Never have I ever been skydiving",
    "Never have I ever sent a text to the wrong person",
    "Never have I ever pretended to like a gift",
    "Never have I ever cried during a movie",
    "Never have I ever fallen asleep during a date",
    "Never have I ever Googled my own name",
    "Never have I ever danced on a table",
  ];

  const generateNeverHaveI = () => {
    const random = neverHaveIStatements[Math.floor(Math.random() * neverHaveIStatements.length)];
    setNeverHaveI(random);
  };

  const sendQuestionToChat = async (type, question, options) => {
    if (onSendQuestion) {
      await onSendQuestion({
        type,
        question,
        options
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {currentGame === 'menu' ? '🎮 Mini Games' : ''}
            {currentGame === 'truth-or-dare' && '🤔 Truth or Dare'}
            {currentGame === 'would-you-rather' && '🤷 Would You Rather'}
            {currentGame === 'never-have-i' && '🙈 Never Have I Ever'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Game Menu */}
        {currentGame === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setCurrentGame('truth-or-dare')}
              className="w-full p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-2xl transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Truth or Dare</p>
                  <p className="text-sm opacity-80">Classic game with random prompts</p>
                </div>
                <span className="text-3xl">🤔</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentGame('would-you-rather')}
              className="w-full p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-2xl transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Would You Rather</p>
                  <p className="text-sm opacity-80">Choose between two options</p>
                </div>
                <span className="text-3xl">🤷</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentGame('never-have-i')}
              className="w-full p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-2xl transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Never Have I Ever</p>
                  <p className="text-sm opacity-80">Reveal your secrets</p>
                </div>
                <span className="text-3xl">🙈</span>
              </div>
            </button>
          </div>
        )}

        {/* Truth or Dare Game */}
        {currentGame === 'truth-or-dare' && (
          <div className="space-y-4">
            <div className="flex space-x-3 mb-6">
              <button
                onClick={() => {
                  const question = truths[Math.floor(Math.random() * truths.length)];
                  setTruthOrDare(question);
                }}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-all"
              >
                Truth
              </button>
              <button
                onClick={() => {
                  const question = dares[Math.floor(Math.random() * dares.length)];
                  setTruthOrDare(question);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-all"
              >
                Dare
              </button>
            </div>

            {truthOrDare && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                  <p className="text-xl">{truthOrDare}</p>
                </div>
                {onSendQuestion && (
                  <button
                    onClick={() => {
                      const isTruth = truths.includes(truthOrDare);
                      sendQuestionToChat(
                        'truth-or-dare',
                        truthOrDare,
                        isTruth ? ['Yes', 'No', 'Maybe'] : ['Did it! ✓', 'Skip 😅']
                      );
                    }}
                    className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold transition-all hover:bg-opacity-90 flex items-center justify-center space-x-2"
                  >
                    <FiSend className="w-5 h-5" />
                    <span>Send to Chat</span>
                  </button>
                )}
              </motion.div>
            )}

            <button
              onClick={() => setCurrentGame('menu')}
              className="w-full py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* Would You Rather Game */}
        {currentGame === 'would-you-rather' && (
          <div className="space-y-4">
            {!wouldYouRather ? (
                <button
                  onClick={generateWouldYouRather}
                  className="w-full py-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-bold text-lg transition-all"
                >
                  Get Question
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-center font-bold text-lg mb-4">Would you rather...</p>
                  
                  <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center">
                    <p className="text-lg">{wouldYouRather.option1}</p>
                  </div>

                  <p className="text-center font-bold">OR</p>

                  <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center">
                    <p className="text-lg">{wouldYouRather.option2}</p>
                  </div>

                  {onSendQuestion && (
                    <button
                      onClick={() => sendQuestionToChat(
                        'would-you-rather',
                        'Would you rather...',
                        [wouldYouRather.option1, wouldYouRather.option2]
                      )}
                      className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold transition-all hover:bg-opacity-90 flex items-center justify-center space-x-2"
                    >
                      <FiSend className="w-5 h-5" />
                      <span>Send to Chat</span>
                    </button>
                  )}

                <button
                  onClick={generateWouldYouRather}
                  className="w-full py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <FiRefreshCw className="w-5 h-5" />
                  <span>Next Question</span>
                </button>
              </motion.div>
            )}

            <button
              onClick={() => {
                setCurrentGame('menu');
                setWouldYouRather(null);
              }}
              className="w-full py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* Never Have I Ever Game */}
        {currentGame === 'never-have-i' && (
          <div className="space-y-4">
            {!neverHaveI ? (
              <button
                onClick={generateNeverHaveI}
                className="w-full py-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-bold text-lg transition-all"
              >
                Get Statement
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                  <p className="text-xl">{neverHaveI}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500 bg-opacity-50 rounded-xl p-3 text-center">
                    <p className="font-bold">I Have! ✓</p>
                  </div>
                  <div className="bg-red-500 bg-opacity-50 rounded-xl p-3 text-center">
                    <p className="font-bold">I Haven't ✗</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {onSendQuestion && (
                    <button
                      onClick={() => sendQuestionToChat(
                        'never-have-i',
                        neverHaveI,
                        ['I Have! ✓', 'I Haven\'t ✗']
                      )}
                      className="flex-1 py-3 bg-white text-purple-600 rounded-xl font-bold transition-all hover:bg-opacity-90 flex items-center justify-center space-x-2"
                    >
                      <FiSend className="w-5 h-5" />
                      <span>Send to Chat</span>
                    </button>
                  )}
                  <button
                    onClick={generateNeverHaveI}
                    className="px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => {
                setCurrentGame('menu');
                setNeverHaveI('');
              }}
              className="w-full py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
            >
              Back to Menu
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MiniGames;

