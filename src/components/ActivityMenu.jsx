import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiYoutube, FiMusic } from 'react-icons/fi';
import { SiSpotify, SiApplemusic } from 'react-icons/si';

const ActivityMenu = ({ isOpen, onClose, partnerId, partnerName, socket }) => {
  const [showYouTube, setShowYouTube] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');

  const handlePokeClick = () => {
    if (socket) {
      socket.emit('send_poke', { to: partnerId });
      
      // Vibrate locally
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      onClose();
    }
  };

  const handleYouTubeWatch = () => {
    if (youtubeUrl) {
      // Extract video ID from YouTube URL
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        socket?.emit('start_youtube_together', {
          to: partnerId,
          videoId,
          url: youtubeUrl
        });
        setShowYouTube(false);
        onClose();
      }
    }
  };

  const handleSpotifyListen = () => {
    if (spotifyUrl) {
      socket?.emit('start_spotify_together', {
        to: partnerId,
        url: spotifyUrl
      });
      setShowSpotify(false);
      onClose();
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl w-full max-w-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Activities with {partnerName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Poke Button */}
          <button
            onClick={handlePokeClick}
            className="w-full mb-4 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:shadow-soft-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-3xl">👉</span>
              <div className="text-left">
                <p className="font-semibold">Poke {partnerName}</p>
                <p className="text-sm opacity-90">Vibrates their phone 3 times</p>
              </div>
            </div>
          </button>

          {/* YouTube Together */}
          <div className="mb-4">
            {!showYouTube ? (
              <button
                onClick={() => setShowYouTube(true)}
                className="w-full p-4 bg-red-500 text-white rounded-2xl hover:shadow-soft-lg transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FiYoutube className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold">Watch YouTube Together</p>
                    <p className="text-sm opacity-90">Share a video to watch</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-red-50 rounded-2xl">
                <div className="flex items-center space-x-2 mb-3">
                  <FiYoutube className="w-5 h-5 text-red-600" />
                  <p className="font-semibold text-gray-800">YouTube URL</p>
                </div>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 rounded-xl bg-white shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleYouTubeWatch}
                    disabled={!youtubeUrl}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    Start Watching
                  </button>
                  <button
                    onClick={() => {
                      setShowYouTube(false);
                      setYoutubeUrl('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spotify Together */}
          <div className="mb-4">
            {!showSpotify ? (
              <button
                onClick={() => setShowSpotify(true)}
                className="w-full p-4 bg-green-500 text-white rounded-2xl hover:shadow-soft-lg transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <SiSpotify className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold">Listen on Spotify</p>
                    <p className="text-sm opacity-90">Share a song or playlist</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center space-x-2 mb-3">
                  <SiSpotify className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-gray-800">Spotify Link</p>
                </div>
                <input
                  type="text"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-4 py-2 rounded-xl bg-white shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSpotifyListen}
                    disabled={!spotifyUrl}
                    className="flex-1 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                  >
                    Start Listening
                  </button>
                  <button
                    onClick={() => {
                      setShowSpotify(false);
                      setSpotifyUrl('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Apple Music */}
          <button
            onClick={() => {
              // Apple Music integration would go here
              alert('Apple Music integration - paste your Apple Music link in chat!');
              onClose();
            }}
            className="w-full p-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl hover:shadow-soft-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <SiApplemusic className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Listen on Apple Music</p>
                <p className="text-sm opacity-90">Share a song or playlist</p>
              </div>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityMenu;

