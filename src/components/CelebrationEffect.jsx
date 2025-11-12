import { useEffect, useState } from 'react';

const CelebrationEffect = ({ trigger }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      createParticles();
    }
  }, [trigger]);

  const createParticles = () => {
    const newParticles = [];
    const emojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🔥', '👏'];
    
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360
      });
    }

    setParticles(newParticles);

    // Clean up after animation
    setTimeout(() => {
      setParticles([]);
    }, 3000);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="celebration-particle absolute bottom-0"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default CelebrationEffect;

