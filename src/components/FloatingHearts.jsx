import { useEffect, useState } from 'react';

const FloatingHearts = ({ trigger }) => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (trigger) {
      createHearts();
    }
  }, [trigger]);

  const createHearts = () => {
    const newHearts = [];
    const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝'];
    
    for (let i = 0; i < 10; i++) {
      newHearts.push({
        id: Date.now() + i,
        emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5
      });
    }

    setHearts(newHearts);

    // Clean up after animation
    setTimeout(() => {
      setHearts([]);
    }, 3000);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart absolute bottom-0"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`
          }}
        >
          {heart.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;

