import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { 
  FiPhone, FiPhoneOff, FiMic, FiMicOff, 
  FiVideo, FiVideoOff, FiX 
} from 'react-icons/fi';

const VideoCall = ({ partnerId, partnerName, isIncoming, onClose }) => {
  const { socket } = useSocket();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const ringtoneRef = useRef(null);

  // ICE servers configuration for WebRTC
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for call answered
    socket.on('call_answered', handleCallAnswered);
    socket.on('ice_candidate', handleNewICECandidate);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('call_answered', handleCallAnswered);
      socket.off('ice_candidate', handleNewICECandidate);
      socket.off('call_ended', handleCallEnded);
      cleanup();
    };
  }, [socket]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const startLocalStream = async (audioOnly = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: !audioOnly
      });
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone');
      throw error;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          to: partnerId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setCallStatus('connected');
      
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  const startCall = async (audioOnly = false) => {
    try {
      const stream = await startLocalStream(audioOnly);
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: !audioOnly
      });
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        to: partnerId,
        offer: offer
      });

      setCallStatus('calling');
    } catch (error) {
      console.error('Error starting call:', error);
      onClose();
    }
  };

  // Auto-start call when component mounts (if not incoming)
  useEffect(() => {
    if (!isIncoming && !localStream) {
      const audioOnly = isIncoming?.audioOnly || false;
      startCall(audioOnly);
    }
  }, []);

  const answerCall = async (offer) => {
    try {
      const stream = await startLocalStream(false);
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', {
        to: partnerId,
        answer: answer
      });

      setCallStatus('connected');
    } catch (error) {
      console.error('Error answering call:', error);
      onClose();
    }
  };

  const handleCallAnswered = async ({ answer }) => {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStatus('connected');
    } catch (error) {
      console.error('Error handling call answer:', error);
    }
  };

  const handleNewICECandidate = async ({ candidate }) => {
    try {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleCallEnded = () => {
    cleanup();
    onClose();
  };

  const endCall = () => {
    socket.emit('end_call', { to: partnerId });
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Remote video (full screen) */}
        <div className="flex-1 relative bg-gray-900">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                  <span className="text-5xl text-white font-bold">
                    {partnerName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-white text-2xl font-semibold mb-2">
                  {partnerName}
                </h2>
                <p className="text-gray-400">
                  {callStatus === 'calling' && 'Calling...'}
                  {callStatus === 'incoming' && 'Incoming call...'}
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && 'Connected'}
                </p>
              </div>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {localStream && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-32 h-40 rounded-2xl overflow-hidden shadow-soft-lg"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </motion.div>
          )}

          {/* Call status */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-full">
            <span className="text-white text-sm">
              {callStatus === 'calling' && '📞 Calling...'}
              {callStatus === 'incoming' && '📞 Incoming call'}
              {callStatus === 'connecting' && '⏳ Connecting...'}
              {callStatus === 'connected' && '🟢 Connected'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black bg-opacity-90 p-6">
          <div className="flex justify-center items-center space-x-4">
            {/* Mute button */}
            {callStatus !== 'incoming' && (
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-all ${
                  isMuted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
              </button>
            )}

            {/* Video toggle button */}
            {callStatus !== 'incoming' && localStream?.getVideoTracks().length > 0 && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoOff 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? <FiVideoOff className="w-6 h-6" /> : <FiVideo className="w-6 h-6" />}
              </button>
            )}

            {/* Answer/Reject for incoming calls */}
            {callStatus === 'incoming' && (
              <>
                <button
                  onClick={() => answerCall(isIncoming.offer)}
                  className="p-6 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all shadow-soft-lg"
                >
                  <FiPhone className="w-8 h-8" />
                </button>
                <button
                  onClick={endCall}
                  className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-soft-lg"
                >
                  <FiPhoneOff className="w-8 h-8" />
                </button>
              </>
            )}

            {/* End call button */}
            {callStatus !== 'incoming' && (
              <button
                onClick={endCall}
                className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-soft-lg"
              >
                <FiPhoneOff className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCall;

