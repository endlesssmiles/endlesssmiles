import { useEffect, useState } from "react";

interface Heart {
  id: number;
  x: number;
  size: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
  drift: number; // horizontal sway amount
}

const HEART_COUNT = 30;

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const initialHearts: Heart[] = [];
    for (let i = 0; i < HEART_COUNT; i++) {
      initialHearts.push(createHeart(i));
    }
    setHearts(initialHearts);
  }, []);

  const createHeart = (id: number): Heart => {
    return {
      id,
      x: Math.random() * 100,
      size: Math.random() * 18 + 8,
      opacity: Math.random() * 0.2 + 0.04,
      animationDelay: Math.random() * 20, // stagger starts over 20s so they don't all appear at once
      animationDuration: Math.random() * 14 + 12, // 12-26s per cycle
      drift: (Math.random() - 0.5) * 60, // horizontal sway -30px to +30px
    };
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none w-full h-full">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute heart-rise"
          style={{
            left: `${heart.x}%`,
            opacity: heart.opacity,
            animationDelay: `${heart.animationDelay}s`,
            animationDuration: `${heart.animationDuration}s`,
            ["--heart-drift" as string]: `${heart.drift}px`,
          }}
        >
          <svg
            width={heart.size}
            height={heart.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-love-300 dark:text-love-400"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
