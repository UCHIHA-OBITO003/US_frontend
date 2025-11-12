import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiSend, FiMoreVertical,
  FiHeart, FiSmile, FiCamera, FiPhone, FiVideo
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import FloatingHearts from '../components/FloatingHearts';
import CameraCapture from '../components/CameraCapture';
import VideoCall from '../components/VideoCall';
import { format } from 'date-fns';

const Chat = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [streak, setStreak] = useState(null);
  const [showHearts, setShowHearts] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchPartner();
    fetchMessages();
    fetchStreak();
  }, [partnerId]);

  useEffect(() => {
    if (socket && connected) {
      // Remove previous listeners to avoid duplicates
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('message_delivered');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('message_read_receipt');
      socket.off('hearts_trigger');
      socket.off('partner_screenshot');
      socket.off('incoming_call');
      socket.off('message_error');

      // Add new listeners
      socket.on('new_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('message_delivered', handleMessageDelivered);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stopped_typing', handleUserStoppedTyping);
      socket.on('message_read_receipt', handleReadReceipt);
      socket.on('hearts_trigger', () => setShowHearts(prev => !prev));
      socket.on('partner_screenshot', handleScreenshotNotification);
      socket.on('incoming_call', handleIncomingCall);
      socket.on('message_error', (data) => toast.error(data.error));

      console.log('✅ Socket listeners attached');
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('message_sent');
        socket.off('message_delivered');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
        socket.off('message_read_receipt');
        socket.off('hearts_trigger');
        socket.off('partner_screenshot');
        socket.off('incoming_call');
        socket.off('message_error');
      }
    };
  }, [socket, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartner = async () => {
    try {
      const response = await axios.get(`/api/user/${partnerId}`);
      setPartner(response.data.user);
    } catch (error) {
      console.error('Failed to fetch partner:', error);
      toast.error('User not found');
      navigate('/home');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${partnerId}`);
      setMessages(response.data.messages);
      
      // Mark unread messages as read
      response.data.messages.forEach(msg => {
        if (msg.to._id === user.id && !msg.isRead) {
          socket?.emit('message_read', { 
            messageId: msg._id, 
            senderId: partnerId 
          });
        }
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (error.response?.status === 403) {
        toast.error('You can only message friends');
        navigate('/home');
      }
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await axios.get(`/api/special/streak/${partnerId}`);
      setStreak(response.data.streak);
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    }
  };

  const handleNewMessage = (message) => {
    console.log('📨 New message received:', message);
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m._id === message._id)) {
        return prev;
      }
      return [...prev, message];
    });
    
    // Mark as read if it's for current user
    if (message.to._id === user.id || message.to === user.id) {
      socket?.emit('message_read', { 
        messageId: message._id, 
        senderId: partnerId 
      });
    }
  };

  const handleMessageSent = (message) => {
    console.log('✅ Message sent confirmation:', message);
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(m => m._id === message._id);
      if (exists) {
        // Update existing message
        return prev.map(m => m._id === message._id ? message : m);
      }
      return [...prev, message];
    });
  };

  const handleMessageDelivered = ({ messageId, deliveredAt }) => {
    console.log('✓ Message delivered:', messageId);
  };

  const handleUserTyping = (data) => {
    if (data.userId === partnerId) {
      setIsTyping(true);
    }
  };

  const handleUserStoppedTyping = (data) => {
    if (data.userId === partnerId) {
      setIsTyping(false);
    }
  };

  const handleReadReceipt = ({ messageId, readAt }) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, isRead: true, readAt } : msg
    ));
  };

  const handleScreenshotNotification = (data) => {
    toast(`${data.message} 📸`, {
      icon: '⚠️',
      duration: 5000,
    });
  };

  const handleIncomingCall = (data) => {
    setIncomingCall(data);
    setShowVideoCall(true);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Emit typing indicator
    if (socket && !typingTimeoutRef.current) {
      socket.emit('typing_start', { to: partnerId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing_stop', { to: partnerId });
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !connected) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socket, 
        connected 
      });
      return;
    }

    console.log('📤 Sending message...');

    const messageData = {
      to: partnerId,
      content: newMessage.trim(),
      type: 'text',
      isSnap: false
    };

    socket.emit('send_message', messageData);
    
    setNewMessage('');
    setShowEmojiPicker(false);

    // Stop typing indicator
    socket.emit('typing_stop', { to: partnerId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleSnapCapture = async (imageData) => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to server
      const formData = new FormData();
      formData.append('file', blob, 'snap.jpg');

      const uploadResponse = await axios.post('/api/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const mediaUrl = uploadResponse.data.mediaUrl;

      // Send as snap
      socket?.emit('send_message', {
        to: partnerId,
        content: '',
        type: 'snap',
        mediaUrl,
        isSnap: true
      });

      // Update streak
      try {
        await axios.post('/api/special/streak/update', { 
          partnerId,
          isSnap: true 
        });
        // Refresh streak
        fetchStreak();
      } catch (error) {
        console.error('Failed to update streak:', error);
      }

      toast.success('Snap sent! 📸');
    } catch (error) {
      console.error('Failed to send snap:', error);
      toast.error('Failed to send snap');
    }
  };

  const handleReaction = (messageId, emoji) => {
    socket?.emit('add_reaction', { 
      messageId, 
      emoji, 
      partnerId 
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const startAudioCall = () => {
    // Similar to video call but audio only
    setShowVideoCall(true);
  };

  if (!partner) {
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
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
        <FloatingHearts trigger={showHearts} />

        {/* Header */}
        <div className="bg-white shadow-soft p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold">
                {partner.displayName?.charAt(0).toUpperCase()}
              </div>
              {partner.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full shadow-soft" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">
                {partner.displayName}
              </h2>
              <p className="text-xs text-gray-500">
                {partner.isOnline ? 'Online' : `Last seen ${format(new Date(partner.lastSeen), 'p')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={startAudioCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Audio call"
            >
              <FiPhone className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={startVideoCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Video call"
            >
              <FiVideo className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <FiMoreVertical className="w-6 h-6 text-gray-700" />
              
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-soft-lg p-3 w-48 text-left"
                >
                  {streak && (
                    <div className="p-3 border-b">
                      <p className="text-sm font-semibold text-gray-700">🔥 Streak</p>
                      <p className="text-xl font-bold text-pink-500">{streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}</p>
                      <p className="text-xs text-gray-500">
                        {streak.bothSnappedToday ? '✅ Both snapped today!' : '⏳ Keep snapping!'}
                      </p>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-gray-600">👻 Snap Score</p>
                    <p className="text-lg font-bold text-purple-500">{partner.snapScore || 0}</p>
                  </div>
                </motion.div>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!connected && (
            <div className="text-center py-2">
              <span className="text-xs text-red-500">⚠️ Connecting...</span>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => {
              const isSent = message.from._id === user.id || message.from === user.id;
              const showAvatar = index === 0 || messages[index - 1].from._id !== message.from._id;

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  {!isSent && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white text-sm font-bold mr-2">
                      {partner.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!isSent && !showAvatar && <div className="w-8 mr-2" />}

                  <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
                    {message.isSnap && (
                      <div className="mb-1 flex items-center space-x-1">
                        <FiCamera className="w-3 h-3" />
                        <span className="text-xs font-semibold">Snap</span>
                      </div>
                    )}
                    
                    {message.type === 'text' && <p>{message.content}</p>}
                    
                    {message.type === 'snap' && message.mediaUrl && (
                      <div className="relative">
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${message.mediaUrl}`} 
                          alt="Snap" 
                          className="rounded-xl max-w-xs"
                        />
                        {!message.viewedAt && !isSent && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                            <span className="text-white text-sm">👆 Tap to view</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions */}
                    {message.reactions?.length > 0 && (
                      <div className="mt-1 flex space-x-1">
                        {message.reactions.map((reaction, idx) => (
                          <span key={idx} className="text-xs">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`text-xs mt-1 ${isSent ? 'text-pink-100' : 'text-gray-500'}`}>
                      {format(new Date(message.createdAt), 'p')}
                      {isSent && (
                        <span className="ml-1">
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                      {message.isSnap && message.viewedAt && (
                        <span className="ml-1">👁️ Viewed</span>
                      )}
                    </div>
                  </div>

                  {/* Quick reaction */}
                  <button
                    onClick={() => handleReaction(message._id, '❤️')}
                    className="ml-2 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <FiHeart className="w-4 h-4 text-pink-500" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center text-white text-sm font-bold">
                {partner.displayName?.charAt(0).toUpperCase()}
              </div>
              <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white shadow-soft p-4">
          {showEmojiPicker && (
            <div className="mb-2">
              <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiCamera className="w-6 h-6 text-pink-600" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiSmile className="w-5 h-5 text-gray-600" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 px-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() || !connected}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleSnapCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Video call modal */}
      {showVideoCall && (
        <VideoCall
          partnerId={partnerId}
          partnerName={partner.displayName}
          isIncoming={incomingCall}
          onClose={() => {
            setShowVideoCall(false);
            setIncomingCall(null);
          }}
        />
      )}
    </>
  );
};

export default Chat;

