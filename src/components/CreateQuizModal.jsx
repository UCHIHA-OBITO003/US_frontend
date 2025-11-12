import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateQuizModal = ({ isOpen, onClose, onCreate }) => {
  const [quizType, setQuizType] = useState('emoji');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [step, setStep] = useState(1); // 1: type, 2: question, 3: options

  const quizTypes = [
    {
      id: 'emoji',
      name: 'Pick an Emoji',
      icon: '😊',
      description: 'Express with emojis',
      color: 'from-yellow-400 to-orange-400',
      placeholder: 'How are you feeling right now?',
      defaultOptions: ['😊', '😎', '🥳', '😌', '🤔', '😴']
    },
    {
      id: 'song',
      name: 'Song Choice',
      icon: '🎵',
      description: 'Music preferences',
      color: 'from-purple-400 to-pink-400',
      placeholder: 'What song matches your mood?',
      defaultOptions: ['Happy', 'Sad', 'Energetic', 'Chill']
    },
    {
      id: 'custom',
      name: 'Custom Question',
      icon: '💭',
      description: 'Ask anything!',
      color: 'from-blue-400 to-cyan-400',
      placeholder: 'What\'s your favorite...?',
      defaultOptions: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    },
    {
      id: 'truth-or-dare',
      name: 'Truth or Dare',
      icon: '🤔',
      description: 'Classic game',
      color: 'from-red-400 to-pink-400',
      placeholder: 'Would you rather...?',
      defaultOptions: ['Truth', 'Dare']
    },
    {
      id: 'would-you-rather',
      name: 'Would You Rather',
      icon: '🤷',
      description: 'Choose between two',
      color: 'from-indigo-400 to-purple-400',
      placeholder: 'Would you rather fly or be invisible?',
      defaultOptions: ['Fly', 'Be Invisible']
    }
  ];

  const selectedType = quizTypes.find(t => t.id === quizType);

  const handleTypeSelect = (type) => {
    setQuizType(type.id);
    setQuestion(type.placeholder);
    setOptions(type.defaultOptions.slice(0, 4).map((opt, i) => opt || `Option ${i + 1}`));
    setStep(2);
  };

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    onCreate({
      type: quizType,
      question: question.trim(),
      options: validOptions
    });

    // Reset
    setStep(1);
    setQuizType('emoji');
    setQuestion('');
    setOptions(['', '', '', '']);
    onClose();
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Create Quiz</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm opacity-90">
            {step === 1 && 'Choose a quiz type'}
            {step === 2 && 'Enter your question'}
            {step === 3 && 'Set the options'}
          </p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {quizTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${type.color} text-white text-left`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <p className="font-bold text-sm">{type.name}</p>
                  <p className="text-xs opacity-80">{type.description}</p>
                </motion.button>
              ))}
            </div>
          )}

          {/* Step 2: Enter Question */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none"
              />
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Set Options */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer Options
              </label>
              <div className="space-y-2 mb-4">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 8 && (
                <button
                  onClick={addOption}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center space-x-2"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Add Option</span>
                </button>
              )}

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <FiSend className="w-5 h-5" />
                  <span>Send Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateQuizModal;

