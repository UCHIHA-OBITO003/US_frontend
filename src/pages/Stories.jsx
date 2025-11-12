import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiX, FiEye } from 'react-icons/fi';
import CameraWithFilters from '../components/CameraWithFilters';

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
    fetchMyStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get('/api/stories/friends');
      setStories(response.data.stories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  const fetchMyStories = async () => {
    try {
      const response = await axios.get('/api/stories/my-stories');
      setMyStories(response.data.stories);
    } catch (error) {
      console.error('Failed to fetch my stories:', error);
    }
  };

  const handleStoryCapture = async ({ imageData, saveToMemories, postAsStory }) => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to server
      const formData = new FormData();
      formData.append('file', blob, 'story.jpg');

      const uploadResponse = await axios.post('/api/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const mediaUrl = uploadResponse.data.mediaUrl;

      // Post as story if selected
      if (postAsStory) {
        await axios.post('/api/stories/create', {
          mediaUrl,
          type: 'image'
        });
        toast.success('Story posted! 🎉');
        fetchMyStories();
      }

      // Save to memories if selected
      if (saveToMemories) {
        await axios.post('/api/memories/save', {
          mediaUrl,
          type: 'image'
        });
        toast.success('Saved to Memories! 💾');
      }
    } catch (error) {
      console.error('Failed to post story:', error);
      toast.error('Failed to post story');
    }
  };

  const viewStory = async (storyGroup, index) => {
    setViewingStory(storyGroup);
    setCurrentStoryIndex(index);

    // Mark as viewed
    if (storyGroup.stories[index]) {
      await axios.post(`/api/stories/${storyGroup.stories[index]._id}/view`);
    }
  };

  const nextStory = () => {
    if (viewingStory && currentStoryIndex < viewingStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      
      // Mark as viewed
      const story = viewingStory.stories[currentStoryIndex + 1];
      if (story) {
        axios.post(`/api/stories/${story._id}/view`);
      }
    } else {
      setViewingStory(null);
      setCurrentStoryIndex(0);
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-white rounded-full transition-colors shadow-soft"
            >
              <FiArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 ml-4">Stories</h1>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Add Story */}
          <button
            onClick={() => setShowCamera(true)}
            className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center hover:shadow-soft-lg transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-2">
              <FiPlus className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Add Story</p>
          </button>

          {/* My Stories */}
          {myStories.length > 0 && (
            <button
              onClick={() => viewStory({ user: { displayName: 'You', avatar: user.avatar }, stories: myStories }, 0)}
              className="aspect-square rounded-2xl overflow-hidden relative group"
            >
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${myStories[0].mediaUrl}`}
                alt="My Story"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-sm font-semibold truncate">Your Story</p>
                <p className="text-white text-xs">{myStories.length} snap{myStories.length > 1 ? 's' : ''}</p>
              </div>
              <div className="absolute top-2 right-2">
                <div className="bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                  <FiEye className="w-3 h-3 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-700">
                    {myStories[0].views?.length || 0}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Friends Stories */}
          {stories.map((storyGroup) => (
            <button
              key={storyGroup.user._id}
              onClick={() => viewStory(storyGroup, 0)}
              className={`aspect-square rounded-2xl overflow-hidden relative border-4 ${
                storyGroup.hasViewed ? 'border-gray-300' : 'border-purple-500'
              }`}
            >
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${storyGroup.stories[0].mediaUrl}`}
                alt={storyGroup.user.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-sm font-semibold truncate">{storyGroup.user.displayName}</p>
              </div>
              <div className="absolute top-2 left-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-300 to-blue-300 flex items-center justify-center text-white text-sm font-bold border-2 border-white">
                  {storyGroup.user.displayName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {stories.length === 0 && myStories.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-600 mb-2">No stories yet</p>
            <p className="text-sm text-gray-500">Be the first to share a story!</p>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraWithFilters
          onCapture={handleStoryCapture}
          onClose={() => setShowCamera(false)}
          allowStory={true}
        />
      )}

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 p-2 flex space-x-1">
              {viewingStory.stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all ${
                      index === currentStoryIndex ? 'w-full' : index < currentStoryIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => setViewingStory(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* User info */}
            <div className="absolute top-12 left-4 flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-300 to-blue-300 flex items-center justify-center text-white font-bold">
                {viewingStory.user.displayName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-semibold">{viewingStory.user.displayName}</span>
            </div>

            {/* Story Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${viewingStory.stories[currentStoryIndex]?.mediaUrl}`}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation areas */}
            <div className="absolute inset-0 flex">
              <div className="flex-1" onClick={previousStory} />
              <div className="flex-1" onClick={nextStory} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;

