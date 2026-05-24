import { Heart, Sparkles } from "lucide-react";

const Footer = () => {
  const getYearsTogether = () => {
    const startDate = new Date("2024-05-25");
    const now = new Date();
    // We add an extra year once May 25th passes
    let years = now.getFullYear() - startDate.getFullYear();
    if (now.getMonth() < startDate.getMonth() || (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate())) {
      years--;
    }
    const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
    return {
      word: words[years] || years.toString(),
      isPlural: years !== 1
    };
  };

  const yearsInfo = getYearsTogether();

  return (
    <footer className="py-12 px-4 bg-gradient-to-t from-love-50 to-white dark:from-purple-950 dark:to-[#1A0B2E] border-t border-love-100/50 dark:border-purple-800/50 transition-colors duration-500">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center mb-4 gap-3">
          <Sparkles size={16} className="text-love-400 dark:text-gold-500" />
          <Heart
            size={18}
            className="text-love-500 fill-love-500 dark:text-gold-400 dark:fill-gold-400 animate-heartbeat"
          />
          <span className="font-handwritten text-2xl text-love-500 dark:text-gold-400 text-shadow">
            {yearsInfo.word} {yearsInfo.isPlural ? "Years" : "Year"} With You
          </span>
          <Heart
            size={18}
            className="text-love-500 fill-love-500 dark:text-gold-400 dark:fill-gold-400 animate-heartbeat"
          />
          <Sparkles size={16} className="text-love-400 dark:text-gold-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
          Made with love, for the love of my life.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
          © {new Date().getFullYear()} — Forever Yours ❤️
        </p>
      </div>
    </footer>
  );
};

export default Footer;
