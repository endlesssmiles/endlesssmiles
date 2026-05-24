import React, { useState, useEffect } from "react";
import { Heart, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthScreenProps {
  children: React.ReactNode;
}

const PIN = "2505";

const AuthScreen: React.FC<AuthScreenProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("authenticated") === "true";
  });
  const [isLoading, setIsLoading] = useState(!isAuthenticated);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("authenticated", "true");
    } else {
      setError(true);
      setPinInput("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isAuthenticated && !isLoading) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 bg-[#0A0104] flex flex-col items-center justify-center p-4 overflow-hidden"
        >
          {/* Immersive animated background for loading */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0A0104] to-[#0A0104]"></div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-love-500/10 rounded-full blur-[120px]"
            />
          </div>

          {/* Glowing Heart */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mb-8"
          >
            <div className="absolute inset-0 bg-love-500 blur-[30px] opacity-40 rounded-full"></div>
            <Heart className="w-20 h-20 text-love-500 fill-love-500 drop-shadow-[0_0_25px_rgba(247,93,119,0.8)] relative z-10" />
          </motion.div>

          {/* Typography */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-center"
          >
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-love-300 via-gold-200 to-love-300 tracking-[0.3em] uppercase animate-pulse">
              Loading Our Universe
            </h2>
            <div className="mt-4 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-gold-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0A0104] flex flex-col items-center justify-center p-4 overflow-hidden"
        >
          {/* Immersive animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Deep rich gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0A0104] to-[#0A0104]"></div>
            
            {/* Glowing floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-love-600/20 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-gold-600/10 rounded-full blur-[120px]"
            />
          </div>

          <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            {/* Lock Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(247,93,119,0.15)]">
                <Lock className="w-8 h-8 text-love-400" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-center mb-12 w-full"
            >
              <h2 className="text-4xl font-serif font-medium text-white tracking-wide mb-3 text-shadow-lg">
                Unlock Our Universe
              </h2>
              <p className="text-love-200/60 text-sm font-medium tracking-[0.2em] uppercase">
                Enter your special date
              </p>
            </motion.div>

            <form onSubmit={handlePinSubmit} className="w-full space-y-12">
              <div className="relative w-full">
                {/* Hidden input for mobile keyboard support */}
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 4) setPinInput(val);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  autoFocus
                />
                
                {/* Visual PIN dots */}
                <div className={`flex justify-center items-center gap-6 ${error ? "animate-shake" : ""}`}>
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pinInput.length > index;
                    const isCurrent = pinInput.length === index;
                    
                    return (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          isFilled
                            ? "bg-love-400 shadow-[0_0_15px_rgba(247,93,119,0.8)] scale-110"
                            : isCurrent
                            ? "bg-white/20 border border-white/50 scale-100"
                            : "bg-white/5 border border-white/20 scale-90"
                        }`}
                      />
                    );
                  })}
                </div>
                
                <div className="h-6 mt-6 text-center">
                  {error && (
                    <p className="text-rose-400 text-sm font-medium tracking-wide animate-fade-in">
                      Incorrect PIN. Try again.
                    </p>
                  )}
                </div>
              </div>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                type="submit"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm tracking-[0.2em] uppercase text-xs"
              >
                Enter Vault
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthScreen;
