import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCamera, FiRotateCw, FiSend, FiDownload, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CameraWithFilters = ({ onCapture, onClose, allowStory = false }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [saveToMemories, setSaveToMemories] = useState(false);
  const [postAsStory, setPostAsStory] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const filters = [
    { id: 'none', name: 'Original', filter: 'none' },
    { id: 'grayscale', name: 'B&W', filter: 'grayscale(100%)' },
    { id: 'sepia', name: 'Vintage', filter: 'sepia(100%)' },
    { id: 'warm', name: 'Warm', filter: 'sepia(50%) saturate(150%)' },
    { id: 'cold', name: 'Cold', filter: 'hue-rotate(180deg) saturate(150%)' },
    { id: 'bright', name: 'Bright', filter: 'brightness(150%) contrast(120%)' },
    { id: 'dramatic', name: 'Drama', filter: 'contrast(150%) saturate(150%)' },
    { id: 'vintage', name: 'Retro', filter: 'sepia(40%) contrast(130%) brightness(110%)' },
    { id: 'blur', name: 'Dreamy', filter: 'blur(2px) brightness(110%)' }
  ];

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
      toast.error('Could not access camera');
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
      
      // Apply filter
      ctx.filter = filters.find(f => f.id === selectedFilter)?.filter || 'none';
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
    setSaveToMemories(false);
    setPostAsStory(false);
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const sendSnap = () => {
    if (capturedImage) {
      onCapture({
        imageData: capturedImage,
        saveToMemories,
        postAsStory
      });
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

      {/* Filter selection */}
      {!capturedImage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 rounded-full px-4 py-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-transparent text-white text-sm outline-none"
          >
            {filters.map(filter => (
              <option key={filter.id} value={filter.id} className="bg-black">
                {filter.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera view or captured image */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: filters.find(f => f.id === selectedFilter)?.filter || 'none'
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Filter preview bar */}
            <div className="absolute bottom-20 left-0 right-0 overflow-x-auto">
              <div className="flex space-x-2 px-4 pb-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex-shrink-0 w-16 h-16 rounded-full border-2 ${
                      selectedFilter === filter.id ? 'border-purple-500' : 'border-white'
                    } overflow-hidden`}
                    style={{
                      filter: filter.filter
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
            
            {/* Options */}
            <div className="absolute top-4 right-4 space-y-2">
              {allowStory && (
                <button
                  onClick={() => setPostAsStory(!postAsStory)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    postAsStory 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white bg-opacity-50 text-white'
                  }`}
                >
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Post as Story
                </button>
              )}
              <button
                onClick={() => setSaveToMemories(!saveToMemories)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all block ${
                  saveToMemories 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white bg-opacity-50 text-white'
                }`}
              >
                <FiDownload className="inline w-4 h-4 mr-1" />
                Save to Memories
              </button>
            </div>
          </div>
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
              className="p-6 bg-white rounded-full hover:scale-110 transition-all shadow-soft-lg relative"
            >
              <div className="w-16 h-16 rounded-full border-4 border-gray-300" />
              <FiCamera className="absolute inset-0 m-auto w-8 h-8 text-gray-800" />
            </button>

            {/* Placeholder */}
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
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white flex items-center space-x-2 hover:shadow-soft-lg transition-all"
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

export default CameraWithFilters;

