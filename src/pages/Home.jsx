import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiUser, FiLogOut, FiSettings, FiUserPlus, FiUsers, FiClock, FiMoon } from 'react-icons/fi';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [dailyQuestion, setDailyQuestion] = useState('');
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyQuestion();
    fetchFriends();
    fetchFriendRequests();

    // Listen for real-time friend list updates
    if (socket) {
      socket.on('friend_request_accepted', (data) => {
        console.log('Friend request accepted:', data);
        toast.success(`${data.friendName} accepted your friend request! 🎉`);
        fetchFriends(); // Refresh friends list
      });

      return () => {
        socket.off('friend_request_accepted');
      };
    }
  }, [socket]);

  const fetchDailyQuestion = async () => {
    try {
      const response = await axios.get('/api/special/daily-question');
      setDailyQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to fetch daily question:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends/list');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests/pending');
      setFriendRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/user/search?query=${query}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleUserClick = async (userId, isFriend) => {
    if (isFriend) {
      navigate(`/chat/${userId}`);
    } else {
      // Send friend request
      try {
        await axios.post('/api/friends/request/send', { toUserId: userId });
        toast.success('Friend request sent!');
        setSearchResults(prev => prev.filter(u => u._id !== userId));
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to send friend request');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold shadow-soft">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user?.displayName}
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/night-mode')}
              className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-soft hover:shadow-soft-lg transition-all"
              title="Night Mode"
            >
              <FiMoon className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => navigate('/stories')}
              className="p-3 rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-all"
              title="Stories"
            >
              <FiClock className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={() => navigate('/friend-requests')}
              className="p-3 rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-all relative"
            >
              <FiUserPlus className="w-5 h-5 text-gray-700" />
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-3 rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-all"
            >
              <FiSettings className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-full bg-white shadow-soft hover:shadow-soft-lg transition-all"
            >
              <FiLogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Daily Question */}
        {dailyQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-r from-pink-100 to-purple-100 mb-6"
          >
            <p className="text-sm font-semibold text-purple-700 mb-1">
              💭 Daily Question
            </p>
            <p className="text-gray-800">{dailyQuestion}</p>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-12"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Search Results
            </h3>
            <div className="space-y-2">
              {searchResults.map((result) => {
                const isFriend = friends.some(f => f._id === result._id);
                return (
                  <button
                    key={result._id}
                    onClick={() => handleUserClick(result._id, isFriend)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-pink-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold">
                      {result.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">
                        {result.displayName}
                      </p>
                      <p className="text-sm text-gray-500">@{result.username}</p>
                      <p className="text-xs text-gray-400">👻 {result.snapScore || 0}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl">{result.currentMood}</span>
                      {!isFriend && (
                        <p className="text-xs text-pink-500 mt-1">+ Add Friend</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Friends List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiUsers className="w-5 h-5 mr-2 text-pink-500" />
              Friends ({friends.length})
            </h3>
          </div>
          
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600 mb-2">No friends yet</p>
              <p className="text-sm text-gray-500">
                Search for users and send friend requests!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => navigate(`/chat/${friend._id}`)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-pink-50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold">
                      {friend.displayName?.charAt(0).toUpperCase()}
                    </div>
                    {friend.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full shadow-soft" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">
                      {friend.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      👻 {friend.snapScore || 0} • {friend.currentMood}
                    </p>
                  </div>
                  <span className="text-2xl">{friend.currentMood}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

