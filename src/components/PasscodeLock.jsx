import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PasscodeLock = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, verify against stored passcode
    if (passcode.length >= 4) {
      onUnlock();
    } else {
      toast.error('Invalid passcode');
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full text-center"
      >
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Passcode</h2>
        <p className="text-gray-600 mb-8">Enter your passcode to access the app</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength="6"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="input-field text-center text-2xl tracking-widest mb-4"
            placeholder="••••"
            autoFocus
          />

          <button type="submit" className="btn-primary w-full">
            Unlock
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PasscodeLock;

