import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiSend, FiMoreVertical,
  FiHeart, FiSmile, FiCamera, FiPhone, FiVideo, FiActivity, FiTarget
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import CelebrationEffect from '../components/CelebrationEffect';
import CameraWithFilters from '../components/CameraWithFilters';
import VideoCall from '../components/VideoCall';
import ActivityMenu from '../components/ActivityMenu';
import CompatibilityQuiz from '../components/CompatibilityQuiz';
import QuizReveal from '../components/QuizReveal';
import CreateQuizModal from '../components/CreateQuizModal';
import CompatibilityScore from '../components/CompatibilityScore';
import MiniGames from '../components/MiniGames';
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [youtubeVideo, setYoutubeVideo] = useState(null);
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  
  // Quiz states
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizReveal, setQuizReveal] = useState(null);
  const [showCompatibilityScore, setShowCompatibilityScore] = useState(false);
  const [pendingQuizzes, setPendingQuizzes] = useState(new Map());
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [quizzesInChat, setQuizzesInChat] = useState(new Map()); // Store quizzes as messages

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
      socket.on('celebration_trigger', () => setShowCelebration(prev => !prev));
      socket.on('partner_screenshot', handleScreenshotNotification);
      socket.on('incoming_call', handleIncomingCall);
      socket.on('message_error', (data) => toast.error(data.error));
      socket.on('receive_poke', handleReceivePoke);
      socket.on('poke_sent', () => toast.success('Poke sent! 👉'));
      socket.on('poke_error', (data) => toast.error(data.error));
      socket.on('start_youtube_together', handleYouTubeInvite);
      socket.on('start_spotify_together', handleSpotifyInvite);
      socket.on('new_quiz', handleNewQuiz);
      socket.on('quiz_reveal', handleQuizReveal);
      socket.on('quiz_partner_answered', handleQuizPartnerAnswered);
      socket.on('quiz_error', (data) => {
        toast.error(data.error || 'Quiz error occurred');
      });
      socket.on('quiz_sent', () => {
        // Quiz sent successfully
      });

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
        socket.off('celebration_trigger');
        socket.off('partner_screenshot');
        socket.off('incoming_call');
        socket.off('message_error');
        socket.off('receive_poke');
        socket.off('poke_sent');
        socket.off('poke_error');
        socket.off('start_youtube_together');
        socket.off('start_spotify_together');
        socket.off('new_quiz');
        socket.off('quiz_reveal');
        socket.off('quiz_partner_answered');
        socket.off('quiz_error');
        socket.off('quiz_sent');
      }
    };
  }, [socket, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Refresh quiz status periodically to catch any missed updates
  useEffect(() => {
    if (quizzesInChat.size > 0 && socket && connected) {
      const interval = setInterval(() => {
        quizzesInChat.forEach(async (quizMsg, quizId) => {
          if (quizMsg.status === 'waiting' || quizMsg.status === 'answered') {
            try {
              const response = await axios.get(`/api/compatibility/quiz/${quizId}`);
              const quiz = response.data.quiz;
              
              if (quiz.status === 'revealed' && quiz.answers.length === 2) {
                // Quiz was revealed, update message
                setMessages(prev => prev.map(msg => {
                  if (msg.quizId === quizId || msg._id === `quiz_${quizId}`) {
                    return {
                      ...msg,
                      status: 'revealed',
                      answers: quiz.answers,
                      matched: quiz.answers[0].answer.toLowerCase().trim() === quiz.answers[1].answer.toLowerCase().trim()
                    };
                  }
                  return msg;
                }));
              } else if (quiz.answers.length === 1 && !quizMsg.myAnswer) {
                // Partner answered but we haven't
                const answeredUserId = quiz.answers[0].user._id || quiz.answers[0].user;
                if (answeredUserId.toString() !== user.id.toString()) {
                  setMessages(prev => prev.map(msg => {
                    if (msg.quizId === quizId || msg._id === `quiz_${quizId}`) {
                      return {
                        ...msg,
                        partnerAnswered: true,
                        status: 'waiting_for_you'
                      };
                    }
                    return msg;
                  }));
                }
              }
            } catch (error) {
              // Quiz might not exist or error, ignore
            }
          }
        });
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [quizzesInChat, socket, connected, user.id]);

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

  const handleReceivePoke = (data) => {
    toast(`${data.fromName} poked you! 👉`, {
      icon: '👉',
      duration: 3000,
    });

    // Vibrate 3 times
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  const handleYouTubeInvite = (data) => {
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">{partner.displayName} wants to watch YouTube together! 📺</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setYoutubeVideo(data);
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Watch Now
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Maybe Later
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleSpotifyInvite = (data) => {
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">{partner.displayName} wants to listen on Spotify together! 🎵</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSpotifyTrack(data);
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Listen Now
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Maybe Later
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  // Quiz handlers
  const handleCreateQuiz = async (quizData) => {
    try {
      const response = await axios.post('/api/compatibility/quiz/create', {
        partnerId,
        ...quizData
      });

      const quiz = response.data.quiz;

      // Add quiz as a message in chat
      const quizMessage = {
        _id: `quiz_${quiz._id}`,
        type: 'quiz',
        quizId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        quizType: quiz.type,
        from: { _id: user.id, displayName: user.displayName },
        createdAt: new Date(),
        isQuiz: true,
        status: 'waiting'
      };

      setMessages(prev => [...prev, quizMessage]);
      setQuizzesInChat(prev => {
        const newMap = new Map(prev);
        newMap.set(quiz._id, quizMessage);
        return newMap;
      });

      // Send via socket
      socket?.emit('send_quiz', {
        to: partnerId,
        quizId: quiz._id
      });

      toast.success('Quiz sent! 🎯');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Failed to send quiz');
    }
  };

  // Handle mini games sending questions
  const handleMiniGameQuestion = async (questionData) => {
    await handleCreateQuiz({
      type: questionData.type,
      question: questionData.question,
      options: questionData.options
    });
  };

  // Send random question to both users
  const handleRandomQuestion = async () => {
    try {
      const response = await axios.post('/api/random-quiz/send-random', {
        partnerId
      });

      const quiz = response.data.quiz;

      // Add quiz as a message in chat for sender
      const quizMessage = {
        _id: `quiz_${quiz._id}`,
        type: 'quiz',
        quizId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        quizType: quiz.type,
        from: { _id: user.id, displayName: user.displayName },
        createdAt: new Date(),
        isQuiz: true,
        status: 'waiting',
        isRandom: true
      };

      setMessages(prev => [...prev, quizMessage]);
      setQuizzesInChat(prev => {
        const newMap = new Map(prev);
        newMap.set(quiz._id, quizMessage);
        return newMap;
      });

      // Send via socket
      socket?.emit('send_quiz', {
        to: partnerId,
        quizId: quiz._id
      });

      toast.success('Random question sent to both! 🎲');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send random question:', error);
      toast.error('Failed to send random question');
    }
  };

  // Send Truth or Dare
  const handleTruthOrDare = async (choice) => {
    try {
      const response = await axios.post('/api/truth-or-dare/create', {
        partnerId,
        choice // 'truth' or 'dare'
      });

      const quiz = response.data.quiz;

      // Add quiz as a message in chat
      const quizMessage = {
        _id: `quiz_${quiz._id}`,
        type: 'quiz',
        quizId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        quizType: 'truth-or-dare',
        truthOrDareChoice: quiz.truthOrDareChoice,
        from: { _id: user.id, displayName: user.displayName },
        createdAt: new Date(),
        isQuiz: true,
        status: 'waiting'
      };

      setMessages(prev => [...prev, quizMessage]);
      setQuizzesInChat(prev => {
        const newMap = new Map(prev);
        newMap.set(quiz._id, quizMessage);
        return newMap;
      });

      // Send via socket
      socket?.emit('send_quiz', {
        to: partnerId,
        quizId: quiz._id
      });

      toast.success(`${choice === 'truth' ? 'Truth' : 'Dare'} sent! 🎯`);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send truth or dare:', error);
      toast.error('Failed to send truth or dare');
    }
  };

  const handleNewQuiz = (data) => {
    const { quiz } = data;
    
    // Add quiz as a message in chat
    const quizMessage = {
      _id: `quiz_${quiz._id}`,
      type: 'quiz',
      quizId: quiz._id,
      question: quiz.question,
      options: quiz.options,
      quizType: quiz.type,
      truthOrDareChoice: quiz.truthOrDareChoice,
      isRandom: quiz.isRandom,
      from: quiz.creator,
      createdAt: new Date(),
      isQuiz: true,
      status: 'waiting'
    };

    setMessages(prev => [...prev, quizMessage]);
    setQuizzesInChat(prev => {
      const newMap = new Map(prev);
      newMap.set(quiz._id, quizMessage);
      return newMap;
    });

    // Also set as active quiz for immediate answering
    setActiveQuiz(quiz);
    
    if (quiz.isRandom) {
      toast.success(`🎲 Random question from ${quiz.creator.displayName}!`);
    } else if (quiz.truthOrDareChoice) {
      toast.success(`${quiz.creator.displayName} sent you a ${quiz.truthOrDareChoice === 'truth' ? 'Truth' : 'Dare'}! 🎯`);
    } else {
      toast.success(`${quiz.creator.displayName} sent you a quiz! 🎯`);
    }
    scrollToBottom();
  };

  const handleQuizAnswer = async (answer) => {
    if (!activeQuiz) return;

    try {
      const response = await axios.post(`/api/compatibility/quiz/${activeQuiz._id}/answer`, {
        answer
      });

      // Update quiz message in chat immediately - FORCE UPDATE
      setMessages(prev => {
        const updated = prev.map(msg => {
          if (msg.quizId === activeQuiz._id || msg._id === `quiz_${activeQuiz._id}`) {
            return {
              ...msg,
              myAnswer: answer,
              status: response.data.bothAnswered ? 'revealing' : 'answered',
              partnerAnswered: response.data.bothAnswered ? true : msg.partnerAnswered || false
            };
          }
          return msg;
        });
        return updated;
      });

      // Force re-render
      setTimeout(() => {
        setMessages(prev => [...prev]);
      }, 50);

      // Store locally
      setPendingQuizzes(prev => {
        const newMap = new Map(prev);
        newMap.set(activeQuiz._id, { 
          answer, 
          partnerAnswered: response.data.bothAnswered || false 
        });
        return newMap;
      });

      // Notify partner via socket
      socket?.emit('quiz_answered', {
        quizId: activeQuiz._id,
        partnerId
      });

      if (response.data.bothAnswered) {
        // Will be handled by quiz_reveal event, but update immediately
        toast.success('Both answered! Revealing results... 🎉');
      } else {
        toast.success('Answer submitted! Waiting for your friend... ⏳');
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleQuizReveal = (data) => {
    const { quizId, question, answers, matched } = data;
    
    setQuizReveal({
      quizId,
      question,
      answers,
      matched
    });

    // Update quiz message in chat to show results - FORCE UPDATE
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.quizId === quizId || msg._id === `quiz_${quizId}`) {
          // Find user's answer from the answers array
          const userAnswer = answers.find(a => 
            a.user._id?.toString() === user.id?.toString() || 
            a.user?.toString() === user.id?.toString() ||
            a.user?._id?.toString() === user.id?.toString()
          );
          
          return {
            ...msg,
            status: 'revealed',
            answers: answers,
            matched: matched,
            myAnswer: msg.myAnswer || userAnswer?.answer,
            partnerAnswered: true
          };
        }
        return msg;
      });
      return updated;
    });

    // Force re-render by creating new array reference
    setTimeout(() => {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.quizId === quizId || msg._id === `quiz_${quizId}`) {
            return { ...msg };
          }
          return msg;
        });
      });
    }, 100);

    // Clean up pending quiz
    setPendingQuizzes(prev => {
      const newMap = new Map(prev);
      newMap.delete(quizId);
      return newMap;
    });

    // Close active quiz if it's the same one
    if (activeQuiz?._id === quizId) {
      setActiveQuiz(null);
    }

    // Show toast
    if (matched) {
      toast.success("It's a match! 🎉", { icon: '💕' });
    } else {
      toast('Different answers! 🤷', { icon: '💭' });
    }

    // Scroll to reveal
    scrollToBottom();
  };

  const handleQuizPartnerAnswered = (data) => {
    const { quizId, partnerName } = data;
    
    // Update chat message to show partner has answered - FORCE UPDATE
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.quizId === quizId || msg._id === `quiz_${quizId}`) {
          const newStatus = msg.myAnswer ? 'revealing' : 'waiting_for_you';
          return {
            ...msg,
            partnerAnswered: true,
            status: newStatus
          };
        }
        return msg;
      });
      return updated;
    });

    // Force re-render
    setTimeout(() => {
      setMessages(prev => [...prev]);
    }, 50);
    
    setPendingQuizzes(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(quizId);
      if (existing) {
        newMap.set(quizId, { ...existing, partnerAnswered: true });
      }
      return newMap;
    });

    // Show notification if sender hasn't answered yet
    const quizMessage = messages.find(m => m.quizId === quizId || m._id === `quiz_${quizId}`);
    if (quizMessage && !quizMessage.myAnswer) {
      toast.success(`${partnerName || partner.displayName} answered! Your turn! ⏳`, {
        duration: 5000,
        icon: '⏳'
      });
      // Scroll to quiz message
      scrollToBottom();
    }
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

  const handleSnapCapture = async ({ imageData, saveToMemories, postAsStory }) => {
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

      // Save to memories if selected
      if (saveToMemories) {
        await axios.post('/api/memories/save', {
          mediaUrl,
          type: 'image'
        });
        toast.success('Saved to Memories! 💾');
      }

      // Post as story if selected
      if (postAsStory) {
        await axios.post('/api/stories/create', {
          mediaUrl,
          type: 'image'
        });
        toast.success('Posted as Story! 🎉');
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
    setIncomingCall(null); // Not an incoming call
  };

  const startAudioCall = () => {
    setShowVideoCall(true);
    setIncomingCall({ audioOnly: true }); // Audio-only mode
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
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <CelebrationEffect trigger={showCelebration} />

        {/* Header */}
        <div className="bg-white shadow-soft p-4 flex items-center justify-between flex-shrink-0 z-10">
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

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowCompatibilityScore(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Compatibility Score"
            >
              <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </button>
            <button
              onClick={() => setShowMiniGames(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative group flex-shrink-0"
              title="Mini Games"
            >
              <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRandomQuestion();
                    setShowMiniGames(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm font-semibold text-gray-700"
                >
                  🎲 Random Question
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTruthOrDare('truth');
                    setShowMiniGames(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold text-gray-700"
                >
                  💭 Truth
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTruthOrDare('dare');
                    setShowMiniGames(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold text-gray-700"
                >
                  🔥 Dare
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMiniGames(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-600"
                >
                  More Games...
                </button>
              </div>
            </button>
            <button
              onClick={() => setShowCreateQuiz(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Custom Quiz"
            >
              <FiTarget className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </button>
            <button
              onClick={() => setShowActivityMenu(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Activities"
            >
              <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            <button
              onClick={startAudioCall}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Audio call"
            >
              <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            
            <button
              onClick={startVideoCall}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Video call"
            >
              <FiVideo className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative flex-shrink-0"
            >
              <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              
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

        {/* YouTube/Spotify Player */}
        {youtubeVideo && (
          <div className="bg-black p-2 sm:p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs sm:text-sm">Watching together with {partner.displayName} 📺</p>
                <button
                  onClick={() => setYoutubeVideo(null)}
                  className="text-white hover:text-gray-300 text-xs sm:text-sm px-2 py-1"
                >
                  Close
                </button>
              </div>
              <div className="aspect-video max-h-48 sm:max-h-none">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeVideo.videoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {spotifyTrack && (
          <div className="bg-green-500 p-2 sm:p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs sm:text-sm">Listening together with {partner.displayName} 🎵</p>
                <button
                  onClick={() => setSpotifyTrack(null)}
                  className="text-white hover:text-gray-300 text-xs sm:text-sm px-2 py-1"
                >
                  Close
                </button>
              </div>
              <iframe
                src={`https://open.spotify.com/embed${spotifyTrack.url.split('spotify.com')[1]}`}
                width="100%"
                height="80"
                frameBorder="0"
                allowTransparency="true"
                allow="encrypted-media"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-3 min-h-0">
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

                    {/* Quiz Message */}
                    {message.isQuiz && (
                      <motion.div 
                        className={`bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 max-w-xs ${
                          message.status === 'waiting_for_you' && isSent ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                        }`}
                        animate={message.status === 'waiting_for_you' && isSent ? {
                          scale: [1, 1.02, 1],
                        } : {}}
                        transition={{ duration: 1, repeat: message.status === 'waiting_for_you' && isSent ? Infinity : 0 }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {message.isRandom && '🎲'}
                            {message.truthOrDareChoice === 'truth' && '💭'}
                            {message.truthOrDareChoice === 'dare' && '🔥'}
                            {!message.isRandom && !message.truthOrDareChoice && message.quizType === 'emoji' && '😊'}
                            {!message.isRandom && !message.truthOrDareChoice && message.quizType === 'song' && '🎵'}
                            {!message.isRandom && !message.truthOrDareChoice && message.quizType === 'truth-or-dare' && '🤔'}
                            {!message.isRandom && !message.truthOrDareChoice && message.quizType === 'would-you-rather' && '🤷'}
                            {!message.isRandom && !message.truthOrDareChoice && message.quizType === 'never-have-i' && '🙈'}
                            {!message.isRandom && !message.truthOrDareChoice && !['emoji', 'song', 'truth-or-dare', 'would-you-rather', 'never-have-i'].includes(message.quizType) && '🎯'}
                          </span>
                          <span className="text-xs font-semibold text-purple-600">
                            {message.isRandom && 'Random Question'}
                            {message.truthOrDareChoice === 'truth' && 'Truth'}
                            {message.truthOrDareChoice === 'dare' && 'Dare'}
                            {!message.isRandom && !message.truthOrDareChoice && 'Quiz'}
                          </span>
                          {message.status === 'waiting_for_you' && isSent && (
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-xs font-bold text-yellow-600 ml-auto"
                            >
                              ⚠️
                            </motion.span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800 mb-3">{message.question}</p>
                        
                        {message.status === 'revealed' && message.answers ? (
                          <div className="space-y-2">
                            {message.answers.map((ans, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-2 text-sm">
                                <span className="font-semibold">{ans.user.displayName}:</span> {ans.answer}
                              </div>
                            ))}
                            {message.matched ? (
                              <div className="text-center text-green-600 font-bold text-sm mt-2">
                                ✨ Match! ✨
                              </div>
                            ) : (
                              <div className="text-center text-gray-600 text-sm mt-2">
                                Different answers
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {message.status === 'answered' && message.myAnswer ? (
                              <div className="bg-white rounded-lg p-3 text-sm">
                                <p className="font-semibold text-purple-600 mb-1">Your answer:</p>
                                <p className="text-gray-800">{message.myAnswer}</p>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                  ⏳ Waiting for {partner.displayName}...
                                </p>
                              </div>
                            ) : message.status === 'waiting_for_you' && isSent ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                <p className="font-semibold text-yellow-700 mb-1">⚠️ {partner.displayName} answered!</p>
                                <p className="text-yellow-600 text-xs">Tap an option below to answer:</p>
                                <div className="mt-2 space-y-1">
                                  {message.options?.map((option, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setActiveQuiz({
                                          _id: message.quizId,
                                          type: message.quizType,
                                          question: message.question,
                                          options: message.options,
                                          creator: message.from
                                        });
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg text-sm bg-white hover:bg-purple-50 text-gray-800 cursor-pointer border border-yellow-300"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : message.status === 'revealing' ? (
                              <div className="bg-white rounded-lg p-3 text-sm text-center">
                                <p className="font-semibold text-purple-600 mb-1">Both answered!</p>
                                <p className="text-xs text-gray-500">Revealing results...</p>
                                <div className="flex justify-center space-x-1 mt-2">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                    className="w-2 h-2 bg-purple-500 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-purple-500 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-purple-500 rounded-full"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {message.options?.map((option, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      if (!isSent && message.status === 'waiting') {
                                        setActiveQuiz({
                                          _id: message.quizId,
                                          type: message.quizType,
                                          question: message.question,
                                          options: message.options,
                                          creator: message.from
                                        });
                                      } else if (isSent && message.status === 'waiting_for_you') {
                                        setActiveQuiz({
                                          _id: message.quizId,
                                          type: message.quizType,
                                          question: message.question,
                                          options: message.options,
                                          creator: message.from
                                        });
                                      }
                                    }}
                                    disabled={(isSent && message.status === 'waiting') || (!isSent && message.status !== 'waiting' && message.status !== 'waiting_for_you')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                      (isSent && message.status === 'waiting') || (!isSent && message.status !== 'waiting' && message.status !== 'waiting_for_you')
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-white hover:bg-purple-50 text-gray-800 cursor-pointer'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                                {isSent && message.status === 'waiting' && (
                                  <p className="text-xs text-gray-500 text-center mt-2">
                                    Waiting for answer...
                                  </p>
                                )}
                                {isSent && message.status === 'waiting_for_you' && (
                                  <p className="text-xs text-yellow-600 text-center mt-2 font-semibold">
                                    ⚠️ {partner.displayName} answered! Tap an option above!
                                  </p>
                                )}
                                {!isSent && message.status === 'waiting' && (
                                  <p className="text-xs text-purple-600 text-center mt-2 font-semibold">
                                    👆 Tap an option to answer!
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
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
        <div className="bg-white shadow-soft p-2 sm:p-4 flex-shrink-0">
          {showEmojiPicker && (
            <div className="mb-2 max-h-64 overflow-y-auto">
              <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <FiCamera className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <FiSmile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() || !connected}
              className="p-2 sm:p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <FiSend className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <CameraWithFilters
          onCapture={handleSnapCapture}
          onClose={() => setShowCamera(false)}
          allowStory={true}
        />
      )}

      {/* Activity menu */}
      <ActivityMenu
        isOpen={showActivityMenu}
        onClose={() => setShowActivityMenu(false)}
        partnerId={partnerId}
        partnerName={partner.displayName}
        socket={socket}
      />

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

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={showCreateQuiz}
        onClose={() => setShowCreateQuiz(false)}
        onCreate={handleCreateQuiz}
      />

      {/* Active Quiz Modal */}
      {activeQuiz && (
        <CompatibilityQuiz
          quiz={activeQuiz}
          onAnswer={handleQuizAnswer}
          onClose={() => setActiveQuiz(null)}
          userAnswer={pendingQuizzes.get(activeQuiz._id)?.answer}
          partnerAnswered={pendingQuizzes.get(activeQuiz._id)?.partnerAnswered}
        />
      )}

      {/* Quiz Reveal Modal */}
      {quizReveal && (
        <QuizReveal
          quiz={quizReveal}
          matched={quizReveal.matched}
          onClose={() => setQuizReveal(null)}
        />
      )}

      {/* Compatibility Score Modal */}
      <CompatibilityScore
        partnerId={partnerId}
        partnerName={partner.displayName}
        isOpen={showCompatibilityScore}
        onClose={() => setShowCompatibilityScore(false)}
      />

      {/* Mini Games Modal */}
      <MiniGames
        isOpen={showMiniGames}
        onClose={() => setShowMiniGames(false)}
        onSendQuestion={handleMiniGameQuestion}
        partnerId={partnerId}
        socket={socket}
      />
    </>
  );
};

export default Chat;

