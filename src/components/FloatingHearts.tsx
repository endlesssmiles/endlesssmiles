
import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
}

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Create initial hearts
    const initialHearts: Heart[] = [];
    for (let i = 0; i < 20; i++) {
      initialHearts.push(createHeart(i));
    }
    setHearts(initialHearts);
  }, []);

  const createHeart = (id: number): Heart => {
    return {
      id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.1,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 10 + 10,
    };
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute animate-float-delayed"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            opacity: heart.opacity,
            animationDelay: `${heart.animationDelay}s`,
            animationDuration: `${heart.animationDuration}s`,
            zIndex: 0,
          }}
        >
          <svg
            width={heart.size}
            height={heart.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-love-200"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
