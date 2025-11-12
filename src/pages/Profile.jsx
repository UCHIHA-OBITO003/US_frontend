import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiEdit, FiLock, FiEye, FiEyeOff, FiShield,
  FiMoon, FiSun, FiHeart, FiImage
} from 'react-icons/fi';

const moodEmojis = ['😊', '😍', '🥰', '😎', '🤗', '😴', '🤔', '😌', '🥳', '💪'];

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { theme, changeTheme, themes } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentMood, setCurrentMood] = useState(user?.currentMood || '😊');
  const [passcode, setPasscode] = useState('');
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      await axios.put('/api/user/profile', { displayName });
      updateUser({ displayName });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateMood = async (mood) => {
    try {
      await axios.put('/api/user/mood', { mood });
      setCurrentMood(mood);
      updateUser({ currentMood: mood });
      toast.success('Mood updated!');
    } catch (error) {
      toast.error('Failed to update mood');
    }
  };

  const handleUpdateTheme = async (newTheme) => {
    try {
      await axios.put('/api/user/theme', { theme: newTheme });
      changeTheme(newTheme);
      updateUser({ theme: newTheme });
      toast.success('Theme updated!');
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleSetPasscode = async () => {
    if (passcode.length < 4) {
      toast.error('Passcode must be at least 4 digits');
      return;
    }

    try {
      await axios.put('/api/user/passcode', { passcode });
      toast.success('Passcode set successfully!');
      setPasscode('');
      setShowPasscodeInput(false);
    } catch (error) {
      toast.error('Failed to set passcode');
    }
  };

  const handleToggleBiometric = async () => {
    try {
      await axios.put('/api/user/biometric', { enabled: !biometricEnabled });
      setBiometricEnabled(!biometricEnabled);
      toast.success(`Biometric ${!biometricEnabled ? 'enabled' : 'disabled'}!`);
    } catch (error) {
      toast.error('Failed to toggle biometric');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-soft"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Profile & Settings</h1>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold shadow-soft">
              {displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{displayName}</h2>
              <p className="text-gray-600">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {moodEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleUpdateMood(emoji)}
                    className={`text-3xl p-2 rounded-xl transition-all ${
                      currentMood === emoji
                        ? 'bg-pink-100 scale-110 shadow-soft'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FiHeart className="w-5 h-5 mr-2 text-pink-500" />
            Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(themes).map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleUpdateTheme(themeName)}
                className={`p-4 rounded-2xl capitalize font-semibold transition-all ${
                  theme === themeName
                    ? 'ring-2 ring-pink-500 shadow-soft-lg scale-105'
                    : 'shadow-soft hover:shadow-soft-lg'
                }`}
              >
                <div className={`w-full h-20 rounded-xl bg-gradient-to-r ${themes[themeName].primary} mb-2`} />
                {themeName}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FiShield className="w-5 h-5 mr-2 text-purple-500" />
            Privacy & Security
          </h3>

          <div className="space-y-4">
            {/* Passcode Lock */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FiLock className="w-5 h-5 mr-2 text-gray-700" />
                  <span className="font-semibold text-gray-800">Passcode Lock</span>
                </div>
                <button
                  onClick={() => setShowPasscodeInput(!showPasscodeInput)}
                  className="text-sm text-pink-500 font-semibold"
                >
                  {showPasscodeInput ? 'Cancel' : 'Set'}
                </button>
              </div>
              {showPasscodeInput && (
                <div className="flex space-x-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength="6"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter 4-6 digit passcode"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleSetPasscode}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Biometric */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-gray-700" />
                <span className="font-semibold text-gray-800">Biometric Lock</span>
              </div>
              <button
                onClick={handleToggleBiometric}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  biometricEnabled ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    biometricEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Incognito Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiEyeOff className="w-5 h-5 mr-2 text-gray-700" />
                <div>
                  <p className="font-semibold text-gray-800">Incognito Mode</p>
                  <p className="text-xs text-gray-500">App disguise (Calculator)</p>
                </div>
              </div>
              <button
                onClick={() => setIncognitoMode(!incognitoMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  incognitoMode ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    incognitoMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Special Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            ✨ Special Features
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/shared-album')}
              className="w-full p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl hover:shadow-soft transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiImage className="w-5 h-5 mr-3 text-pink-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Shared Album</p>
                    <p className="text-sm text-gray-600">Your special moments</p>
                  </div>
                </div>
                <span className="text-2xl">📸</span>
              </div>
            </button>

            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Quick Exit</p>
                  <p className="text-sm text-gray-600">Shake phone to exit</p>
                </div>
                <span className="text-2xl">🚪</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold rounded-full shadow-soft hover:shadow-soft-lg transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;

