import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiMoon, FiMessageCircle, FiClock, FiSend, 
  FiLogOut, FiLoader, FiStar, FiPlay
} from 'react-icons/fi';
import MiniGames from '../components/MiniGames';

const NightMode = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [mode, setMode] = useState('menu'); // menu, searching, chatting
  const [chatId, setChatId] = useState(null);
  const [anonymousName, setAnonymousName] = useState('');
  const [partnerName, setPartnerName] = useState('Waiting...');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [conversationStarters, setConversationStarters] = useState([]);
  const [showMiniGames, setShowMiniGames] = useState(false);

  useEffect(() => {
    if (socket && mode === 'chatting' && chatId) {
      // Join anonymous room
      socket.emit('join_anonymous_room', { chatId });

      // Listen for match found
      socket.on('anonymous_match_found', handleMatchFound);
      socket.on('anonymous_message', handleNewMessage);
      socket.on('anonymous_typing', () => setIsTyping(true));
      socket.on('anonymous_stopped_typing', () => setIsTyping(false));
      socket.on('anonymous_chat_ended', handleChatEnded);
      socket.on('anonymous_error', (data) => toast.error(data.error));

      return () => {
        socket.off('anonymous_match_found');
        socket.off('anonymous_message');
        socket.off('anonymous_typing');
        socket.off('anonymous_stopped_typing');
        socket.off('anonymous_chat_ended');
        socket.off('anonymous_error');
      };
    }
  }, [socket, mode, chatId]);

  // Timer countdown
  useEffect(() => {
    if (endsAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(endsAt);
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('Time expired');
          clearInterval(interval);
          handleChatEnded({ reason: 'time_expired' });
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [endsAt]);

  const handleMatchFound = (data) => {
    setEndsAt(data.endsAt);
    toast.success('Match found! Chat for 10 minutes 🌙');
    fetchChatDetails();
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleChatEnded = (data) => {
    toast('Chat ended! Thanks for connecting 🌟', { icon: '👋' });
    setMode('menu');
    setChatId(null);
    setMessages([]);
    setEndsAt(null);
    setTimeLeft(null);
  };

  const fetchChatDetails = async () => {
    if (!chatId) return;
    
    try {
      const response = await axios.get(`/api/night-mode/chat/${chatId}`);
      const { chat } = response.data;
      
      setMessages(chat.messages);
      setPartnerName(chat.partnerName);
      setEndsAt(chat.endsAt);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    }
  };

  const joinQueue = async () => {
    try {
      setMode('searching');
      
      const response = await axios.post('/api/night-mode/join-queue');
      const { matched, chatId: newChatId, anonymousName: name, endsAt: end } = response.data;
      
      setChatId(newChatId);
      setAnonymousName(name);
      setMode('chatting');
      
      if (matched) {
        setEndsAt(end);
        toast.success('Match found! 🎉');
        
        // Fetch chat details
        setTimeout(() => {
          fetchChatDetails();
        }, 500);
      } else {
        toast('Searching for someone to chat with...', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Failed to join queue:', error);
      toast.error(error.response?.data?.error || 'Failed to join queue');
      setMode('menu');
    }
  };

  const leaveQueue = async () => {
    try {
      await axios.post('/api/night-mode/leave-queue');
      setMode('menu');
      setChatId(null);
      toast('Left queue', { icon: '👋' });
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !chatId) return;

    socket.emit('send_anonymous_message', {
      chatId,
      content: newMessage.trim()
    });

    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('anonymous_stopped_typing', { chatId });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && chatId && e.target.value) {
      socket.emit('anonymous_typing', { chatId });
      
      // Stop typing after 2 seconds
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit('anonymous_stopped_typing', { chatId });
      }, 2000);
    }
  };

  const endChat = async () => {
    try {
      await axios.post(`/api/night-mode/end-chat/${chatId}`);
      
      // Notify via socket
      socket?.emit('leave_anonymous_room', { chatId });
      
      setMode('menu');
      setChatId(null);
      setMessages([]);
      setEndsAt(null);
      setTimeLeft(null);
      
      toast('Chat ended', { icon: '👋' });
    } catch (error) {
      console.error('Failed to end chat:', error);
    }
  };

  const fetchConversationStarters = async () => {
    try {
      const response = await axios.get('/api/night-mode/conversation-starters');
      setConversationStarters(response.data.starters);
    } catch (error) {
      console.error('Failed to fetch starters:', error);
    }
  };

  useEffect(() => {
    if (mode === 'chatting') {
      fetchConversationStarters();
    }
  }, [mode]);

  // Menu view
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => navigate('/home')}
              className="p-3 bg-white bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all backdrop-blur-sm"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <FiMoon className="w-6 h-6" />
              <span>Night Mode</span>
            </h1>
            <div className="w-12" />
          </div>

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🌙
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Can't Sleep?</h2>
            <p className="text-lg text-purple-200 mb-2">
              Connect with a random person for a 10-minute anonymous chat
            </p>
            <p className="text-sm text-purple-300">
              No judgments. Just conversations. 💭
            </p>
          </motion.div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={joinQueue}
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all mb-6"
          >
            <FiMessageCircle className="inline w-6 h-6 mr-2 mb-1" />
            Start Anonymous Chat
          </motion.button>

          {/* Features */}
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">10-Minute Timer</h3>
                <p className="text-sm text-purple-200">Chat ends automatically after 10 minutes</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <FiStar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Completely Anonymous</h3>
                <p className="text-sm text-purple-200">Random nicknames, no personal info shared</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <FiMessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Fresh Conversations</h3>
                <p className="text-sm text-purple-200">Every chat is a new connection</p>
              </div>
            </div>
          </div>

          {/* Mini Games Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMiniGames(true)}
            className="w-full mt-6 py-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl font-semibold hover:bg-opacity-20 transition-all flex items-center justify-center space-x-2"
          >
            <FiPlay className="w-5 h-5" />
            <span>Play Mini Games</span>
          </motion.button>

          {/* Tips */}
          <div className="mt-8 p-4 bg-yellow-500 bg-opacity-20 rounded-2xl border border-yellow-500 border-opacity-30">
            <p className="text-sm text-yellow-200">
              💡 <strong>Tip:</strong> Be respectful and kind. This is a safe space for late-night thoughts and conversations.
            </p>
          </div>
        </div>

        {/* Mini Games Modal */}
        <MiniGames isOpen={showMiniGames} onClose={() => setShowMiniGames(false)} />
      </div>
    );
  }

  // Searching view
  if (mode === 'searching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <FiLoader className="w-full h-full" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">Searching for someone...</h2>
          <p className="text-purple-200 mb-8">Finding a fellow night owl to chat with 🦉</p>
          <button
            onClick={leaveQueue}
            className="px-6 py-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Chatting view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-bold">
            {partnerName?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="font-semibold">{partnerName}</h2>
            {isTyping && <p className="text-xs text-purple-300">typing...</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {timeLeft && (
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-semibold">{timeLeft}</span>
            </div>
          )}
          <button
            onClick={() => setShowMiniGames(true)}
            className="p-2 bg-purple-500 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
            title="Mini Games"
          >
            <FiPlay className="w-5 h-5" />
          </button>
          <button
            onClick={endChat}
            className="p-2 bg-red-500 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mini Games Modal */}
      <MiniGames isOpen={showMiniGames} onClose={() => setShowMiniGames(false)} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        <div className="text-center py-6">
          <p className="text-purple-200 text-sm mb-2">
            You are now chatting with <strong>{partnerName}</strong>
          </p>
          <p className="text-purple-300 text-xs">
            Your nickname: <strong>{anonymousName}</strong>
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Chat ends in 10 minutes. Be kind and respectful! 💜
          </p>
        </div>

        {/* Conversation starters */}
        {messages.length === 0 && conversationStarters.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold mb-3">💬 Conversation Starters:</p>
            <div className="space-y-2">
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(starter)}
                  className="w-full text-left text-sm bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user._id || msg.sender === user._id;
          
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-white bg-opacity-20 backdrop-blur-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-black bg-opacity-30 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white bg-opacity-20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default NightMode;

