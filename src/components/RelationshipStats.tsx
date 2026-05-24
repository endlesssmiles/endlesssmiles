import { useEffect, useState, useRef } from "react";
import { Heart, Calendar, Image, BookOpen, Star, Sparkles } from "lucide-react";
import FloatingHearts from "./FloatingHearts";

interface StatItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

const useCountUp = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return { count, ref };
};

const RelationshipStats = () => {
  const startDate = new Date("2024-05-25");
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  const stats: StatItem[] = [
    {
      icon: <Calendar className="w-7 h-7" />,
      value: diffDays,
      label: "Days Together",
    },
    {
      icon: <Heart className="w-7 h-7" />,
      value: diffMonths,
      label: "Months of Love",
    },
    {
      icon: <Image className="w-7 h-7" />,
      value: 14,
      label: "Memories Captured",
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      value: 2,
      label: "Love Letters",
    },
    {
      icon: <Star className="w-7 h-7" />,
      value: 2,
      label: "Anniversaries",
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      value: 1000000,
      label: "Reasons to Smile",
      suffix: "+",
    },
  ];

  return (
    <section className="relative py-20 px-4 bg-section-alt overflow-hidden">
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-3 text-shadow">
          Our Journey in Numbers
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-lg mx-auto">
          Every number tells a part of our story ❤️
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value);
            return (
              <div
                key={i}
                ref={ref}
                className="bg-white/40 sm:bg-white/70 backdrop-blur-md sm:backdrop-blur-[16px] border border-white/20 sm:border-white/40 dark:bg-purple-950/20 sm:dark:bg-purple-950/40 dark:border-purple-800/10 sm:dark:border-purple-800/20 rounded-2xl p-4 sm:p-5 text-center shadow-sm sm:shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-md sm:hover:shadow-premium hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-love-50 dark:bg-purple-900/60 flex items-center justify-center text-love-500 dark:text-gold-400 mb-2 sm:mb-3 group-hover:bg-love-100 dark:group-hover:bg-purple-800 group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-love-600 dark:text-gold-300 mb-1">
                  {stat.value > 99999
                    ? `${Math.floor(count / 1000)}K`
                    : count.toLocaleString()}
                  {stat.suffix || ""}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider leading-tight">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelationshipStats;
