import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCamera, FiRotateCw, FiSend } from 'react-icons/fi';

const CameraCapture = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera');
      onClose();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const sendSnap = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-3 bg-black bg-opacity-50 rounded-full text-white"
      >
        <FiX className="w-6 h-6" />
      </button>

      {/* Camera view or captured image */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-90 p-6">
        {!capturedImage ? (
          <div className="flex justify-center items-center space-x-8">
            {/* Switch camera */}
            <button
              onClick={switchCamera}
              className="p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-all"
            >
              <FiRotateCw className="w-6 h-6" />
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              className="p-6 bg-white rounded-full hover:scale-110 transition-all shadow-soft-lg"
            >
              <FiCamera className="w-10 h-10 text-gray-800" />
            </button>

            {/* Placeholder for symmetry */}
            <div className="w-16" />
          </div>
        ) : (
          <div className="flex justify-center items-center space-x-4">
            {/* Retake */}
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-all"
            >
              Retake
            </button>

            {/* Send snap */}
            <button
              onClick={sendSnap}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white flex items-center space-x-2 hover:shadow-soft-lg transition-all"
            >
              <FiSend className="w-5 h-5" />
              <span>Send Snap</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CameraCapture;

