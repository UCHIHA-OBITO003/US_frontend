import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const FriendRequests = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [pending, sent] = await Promise.all([
        axios.get('/api/friends/requests/pending'),
        axios.get('/api/friends/requests/sent')
      ]);

      setPendingRequests(pending.data.requests);
      setSentRequests(sent.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await axios.post('/api/friends/request/accept', { requestId });
      
      // Notify the sender via socket
      if (socket && response.data.senderId) {
        socket.emit('friend_request_accepted', {
          to: response.data.senderId,
          friendName: response.data.acceptorName
        });
      }
      
      toast.success('Friend request accepted! 🎉');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post('/api/friends/request/reject', { requestId });
      toast.success('Friend request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💕</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Friend Requests</h1>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Received ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-pink-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold">
                      {request.from.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.from.displayName}
                      </p>
                      <p className="text-sm text-gray-500">@{request.from.username}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-soft"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-soft"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Sent ({sentRequests.length})
            </h2>
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold">
                      {request.to.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.to.displayName}
                      </p>
                      <p className="text-sm text-gray-500">@{request.to.username}</p>
                    </div>
                  </div>

                  <span className="text-sm text-gray-500">Pending...</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {pendingRequests.length === 0 && sentRequests.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 mb-2">No friend requests</p>
            <p className="text-sm text-gray-500">
              Search for users to send friend requests!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;

