import { useEffect, useRef } from "react";

const App = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to auto-play when component mounts
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      // Many browsers block autoplay unless there is user interaction,
      // so this might require the user to click the screen first
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay blocked. User needs to interact with the document.");
        });
      }
    }
  }, []);

  const handleInteract = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden cursor-pointer"
      onClick={handleInteract}
    >
      <audio ref={audioRef} src="/fuckoff.mp3" autoPlay loop />
      
      <div 
        className="text-red-500 font-black text-6xl md:text-9xl tracking-widest animate-pulse transition-transform duration-300 hover:scale-110" 
        style={{ 
          textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.4), 0 0 120px rgba(239,68,68,0.2)' 
        }}
      >
        FUCK OFF!!!
      </div>

      <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase font-mono mt-12 animate-pulse">
        click it
      </p>
    </div>
  );
};

export default App;
