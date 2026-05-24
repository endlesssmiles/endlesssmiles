import { useState, useRef, useEffect } from "react";
import { Heart, Music, Volume2 } from "lucide-react";
import FloatingHearts from "./FloatingHearts";

const VISUALIZER_BARS = 20;

const HeroSection = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(VISUALIZER_BARS).fill(4),
  );
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceCreatedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up Web Audio API analyser
  const setupAnalyser = () => {
    if (!audioRef.current || sourceCreatedRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceCreatedRef.current = true;
  };

  // Animate bars
  const animateBars = () => {
    if (!analyserRef.current) {
      // Fallback: random gentle animation
      setBarHeights((prev) => prev.map(() => Math.random() * 28 + 4));
    } else {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const newHeights: number[] = [];
      const step = Math.floor(data.length / VISUALIZER_BARS);
      for (let i = 0; i < VISUALIZER_BARS; i++) {
        const val = data[i * step] || 0;
        newHeights.push((val / 255) * 36 + 4);
      }
      setBarHeights(newHeights);
    }
    animFrameRef.current = requestAnimationFrame(animateBars);
  };

  useEffect(() => {
    if (isMusicPlaying) {
      animFrameRef.current = requestAnimationFrame(animateBars);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setBarHeights(Array(VISUALIZER_BARS).fill(4));
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        // Skip the first 23 seconds if starting from the beginning
        if (audioRef.current.currentTime === 0) {
          audioRef.current.currentTime = 23;
        }
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
    if (!isMusicPlaying) {
      setupAnalyser();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <section
      id="landing"
      className="min-h-screen relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* Animated gradient background — parallax */}
      <div
        className="absolute inset-0 bg-hero-gradient"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      
      {/* Section-scoped floating hearts background */}
      <div className="absolute inset-0 z-0">
        <FloatingHearts />
      </div>



      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto w-full">
        {/* Glassmorphic card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-10 md:p-14 shadow-premium hover:shadow-glow transition-all duration-700 mx-2 sm:mx-0">
          {/* Anniversary badge */}
          <div className="inline-flex items-center gap-2 bg-love-500/10 dark:bg-gold-500/10 border border-love-200 dark:border-gold-500/30 rounded-full px-4 md:px-5 py-1.5 md:py-2 mb-6 animate-fade-in">
            <Heart
              size={14}
              className="text-love-500 fill-love-500 dark:text-gold-400 dark:fill-gold-400 animate-heartbeat"
            />
            <span className="text-xs md:text-sm font-medium text-love-600 dark:text-gold-300 tracking-wide uppercase">
              2nd Anniversary
            </span>
            <Heart
              size={14}
              className="text-love-500 fill-love-500 dark:text-gold-400 dark:fill-gold-400 animate-heartbeat"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-love-600 dark:text-gold-100 mb-4 md:mb-6 leading-tight text-shadow">
            Two Years of
            <br />
            <span className="bg-gradient-to-r from-love-500 via-love-400 to-blush-500 dark:from-gold-300 dark:via-gold-400 dark:to-gold-500 bg-clip-text text-transparent">
              Falling for You
            </span>
            <span className="text-love-500 dark:text-gold-400 animate-heartbeat inline-block ml-2 md:ml-3">
              ❤️
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 font-serif italic leading-relaxed">
            Two years, countless memories... and forever to go.
          </p>

          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-love-300 via-love-500 to-love-300 dark:from-gold-600 dark:via-gold-400 dark:to-gold-600 mx-auto mb-6 md:mb-8 rounded-full" />

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            "The best relationships are made of two people who refuse to give up
            on each other. I don't know about you, But I will never give up on
            you."
          </p>

          {/* Music Visualizer */}
          {isMusicPlaying && (
            <div className="flex items-end justify-center gap-[3px] h-10 mb-6 animate-fade-in">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-love-500 to-love-300 dark:from-gold-400 dark:to-gold-200 transition-all duration-75"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          )}

          <button
            onClick={toggleMusic}
            className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-love-500 dark:bg-gold-500 text-white dark:text-[#1A0B2E] rounded-full font-medium text-sm sm:text-base tracking-wide hover:bg-love-600 dark:hover:bg-gold-400 transition-all duration-300 shadow-[0_0_20px_rgba(247,93,119,0.3)] dark:shadow-[0_0_20px_rgba(220,198,89,0.3)] hover:shadow-[0_0_30px_rgba(247,93,119,0.5)] dark:hover:shadow-[0_0_30px_rgba(220,198,89,0.5)] hover:-translate-y-1"
          >
            {isMusicPlaying ? (
              <Volume2 size={18} className="animate-pulse" />
            ) : (
              <Music
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            <span className="font-medium">
              {isMusicPlaying ? "Pause Our Song" : "Play Our Song"}
            </span>
          </button>

          <audio ref={audioRef} loop crossOrigin="anonymous">
            <source src="/saiyaara.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#timeline"
        className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-float text-love-400 hover:text-love-600 transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium tracking-widest uppercase opacity-60">
            Scroll
          </span>
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
        </div>
      </a>
    </section>
  );
};

export default HeroSection;
