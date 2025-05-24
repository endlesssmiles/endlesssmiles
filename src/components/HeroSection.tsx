import { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import FloatingHearts from "./FloatingHearts";

const HeroSection = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <section
      id="landing"
      className="min-h-screen relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      <div className="absolute inset-0 bg-love-50">
        <FloatingHearts />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-love-600 mb-6">
          Still Falling for You
          <span className="text-love-500 animate-heartbeat inline-block ml-2">
            ❤️
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-8 font-serif italic">
          One year, a thousand memories... and many more to come.
        </p>

        <div className="w-20 h-1 bg-love-300 mx-auto mb-8"></div>

        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          "The best relationships are made of two people who refuse to give up
          on each other. I don't know about you, But I will never give up on
          you."
        </p>

        <button
          onClick={toggleMusic}
          className="flex items-center space-x-2 border border-love-300 rounded-full px-5 py-2 mx-auto bg-white/80 hover:bg-white text-love-600 transition-all shadow-sm hover:shadow"
        >
          <span>{isMusicPlaying ? "Pause Music" : "Play Music"}</span>
          <Heart
            size={16}
            className={isMusicPlaying ? "animate-heartbeat" : ""}
          />
        </button>

        <audio ref={audioRef} loop>
          <source src="/saude-bazi.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      <a
        href="#timeline"
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float text-love-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
};

export default HeroSection;
