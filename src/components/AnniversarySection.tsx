import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, PartyPopper, Clock } from "lucide-react";
import FloatingHearts from "./FloatingHearts";

interface Confetti {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  animationDuration: number;
  rotation: number;
  shape: "circle" | "square" | "heart";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getWordOrdinal = (n: number) => {
  const words = ["Zeroth", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
  return words[n] || getOrdinal(n);
};
const AnniversarySection = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [revealMessage, setRevealMessage] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPast, setIsPast] = useState(false);
  const [yearsTogether, setYearsTogether] = useState(2);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Calculate this year's anniversary date
      let targetDate = new Date(`${currentYear}-05-25T00:00:00`);
      
      // The anniversary grace period ends 5 days after May 25
      const gracePeriodEnd = new Date(targetDate);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);
      
      let isCelebrating = false;
      
      if (now >= targetDate && now <= gracePeriodEnd) {
        // We are currently within the 5 day celebration window
        isCelebrating = true;
      } else if (now > gracePeriodEnd) {
        // The celebration window passed, countdown to NEXT year
        targetDate = new Date(`${currentYear + 1}-05-25T00:00:00`);
      }
      
      const calculatedYears = targetDate.getFullYear() - 2024;
      setYearsTogether(calculatedYears);

      if (isCelebrating) {
        setIsPast(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setIsPast(false);
      const diff = targetDate.getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      generateConfetti();
    }
  }, [showConfetti]);

  const generateConfetti = () => {
    const colors = [
      "#F75D77",
      "#FDE1D3",
      "#FFD1DC",
      "#FFF0F5",
      "#FFC0CB",
      "#FFB6C1",
      "#FF69B4",
      "#FF1493",
      "#DB7093",
      "#C71585",
      "#FFD700",
      "#FFA500",
      "#FF6347",
    ];
    const shapes: ("circle" | "square" | "heart")[] = [
      "circle",
      "square",
      "heart",
    ];
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < 150; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 80,
        size: Math.random() * 12 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    setConfetti(newConfetti);
  };

  const handleTriggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setRevealMessage(true);
    }, 800);
  };

  const CountdownUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <div className="glass rounded-2xl w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shadow-soft">
        <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-love-600">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <section
      id="anniversary"
      className="py-24 px-4 bg-soft-gradient relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Section-scoped floating hearts background */}
      <div className="absolute inset-0 z-0">
        <FloatingHearts />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Sparkles className="text-love-400 w-6 h-6 sm:w-8 sm:h-8" />
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-center text-love-600 text-shadow px-2">
            Our {getWordOrdinal(yearsTogether)} Anniversary
          </h2>
          <Sparkles className="text-love-400 w-6 h-6 sm:w-8 sm:h-8 hidden sm:block" />
        </div>
        <p className="text-center text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto text-base sm:text-lg px-4">
          Do saal humare pyaar, takraar, khushi aur junoon ka 😘
        </p>

        {/* Countdown Timer */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Clock size={18} className="text-love-400" />
            <p className="text-sm font-medium text-love-500 uppercase tracking-widest">
              {isPast
                ? "🎉 It's Anniversary Time! 🎉"
                : `Countdown to ${getOrdinal(yearsTogether)} Anniversary`}
            </p>
          </div>
          {!isPast && (
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 animate-fade-in">
              <CountdownUnit value={timeLeft.days} label="Days" />
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <CountdownUnit value={timeLeft.minutes} label="Mins" />
              <CountdownUnit value={timeLeft.seconds} label="Secs" />
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card
            className={`glass-strong border-none shadow-premium transition-all duration-700 rounded-3xl ${
              revealMessage ? "transform scale-[1.02] shadow-glow" : ""
            }`}
          >
            <CardContent className="p-10 md:p-14 text-center">
              {!showConfetti ? (
                <div className="space-y-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-love-50 dark:bg-purple-900/60 flex items-center justify-center shadow-soft">
                    <PartyPopper className="w-12 h-12 text-love-500 dark:text-gold-400" />
                  </div>
                  <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
                    Click the button below to reveal a special anniversary
                    message.
                  </p>
                  <button
                    onClick={handleTriggerConfetti}
                    className="group bg-gradient-to-r from-love-500 to-love-400 dark:from-gold-600 dark:to-gold-500 hover:from-love-600 hover:to-love-500 dark:hover:from-gold-500 dark:hover:to-gold-400 text-white dark:text-[#1A0B2E] font-medium px-6 py-3 sm:px-10 sm:py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-glow hover:scale-105 text-base sm:text-lg"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles
                        size={20}
                        className="group-hover:animate-spin"
                      />
                      Reveal Anniversary Surprise
                      <Sparkles
                        size={20}
                        className="group-hover:animate-spin"
                      />
                    </span>
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-3xl md:text-5xl font-handwritten text-love-600 dark:text-gold-400 mb-8 leading-relaxed text-shadow">
                    Happy {getOrdinal(yearsTogether)} Anniversary, My Mikku, My Love ❤️
                  </h3>
                  {revealMessage && (
                    <div className="animate-fade-in space-y-6">
                      <p className="text-xl text-gray-700 dark:text-gray-300 font-serif leading-relaxed">
                        ye {yearsTogether} saal kaise nikal gaye pata hei nhi chala... aisa lag raha hai ki aapse kal hei handball mai mila tha jab aap mujhe dhang se janti bhi nhi thi... aur aaj itnaaa close aa gaye hai ki aisa lagta hai ki barso se sath hai🥺🥰
                      </p>
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        ye {getOrdinal(yearsTogether)} year bhi beech mai thodi mushkile aai thi but bhagwan jii haina humare sath fir kaisa dar🥰... unhone saab theek kar diya and i hope ki {getOrdinal(yearsTogether + 1)} year mai koi bhi mushkile na aaye and hum humesha aisehei khush rahe and sath rahe🥰😘😘
                      </p>
                      <div className="pt-6">
                        <div className="text-love-500 dark:text-gold-500 text-6xl md:text-7xl font-handwritten animate-heartbeat inline-block">
                          I love you!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((item) => (
            <div
              key={item.id}
              className="absolute animate-confetti"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
                backgroundColor: item.color,
                borderRadius:
                  item.shape === "circle"
                    ? "50%"
                    : item.shape === "heart"
                      ? "50% 50% 0 0"
                      : "2px",
                animationDuration: `${item.animationDuration}s`,
                transform: `rotate(${item.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AnniversarySection;
