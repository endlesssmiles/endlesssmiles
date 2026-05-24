import { useState, useEffect } from "react";
import { Menu, X, Heart, Moon, Sun } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setIsDark(savedDark);
    if (savedDark) {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('darkMode', String(newDark));
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sections = [
    { id: "landing", label: "Home" },
    { id: "timeline", label: "Our Story" },
    { id: "gallery", label: "Memories" },
    { id: "letters", label: "Letters" },
    { id: "anniversary", label: "Anniversary" },
    { id: "future", label: "Our Future" },
  ];

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);

    if (element) {
      setIsOpen(false);
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: "smooth",
      });
      window.history.pushState({}, "", `#${sectionId}`);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 dark:bg-[#1A0B2E]/90 backdrop-blur-xl shadow-premium py-2 md:py-3"
          : "bg-transparent py-3 md:py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center relative">
        <a
          href="#landing"
          onClick={(e) => handleScrollToSection(e, "landing")}
          className="group flex items-center gap-2 relative z-[51]"
        >
          <span className="font-handwritten text-2xl md:text-3xl text-love-500 font-bold group-hover:text-love-600 transition-colors">
            Endless Smiles
          </span>
          <Heart
            size={18}
            className="text-love-500 fill-love-500 animate-heartbeat"
          />
        </a>

        <div className="hidden md:flex items-center space-x-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleScrollToSection(e, section.id)}
              className="text-sm px-5 py-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-love-600 dark:hover:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-900/50 transition-all duration-300 font-medium tracking-wide"
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-all relative z-[51]"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="md:hidden p-2 -mr-2 rounded-full text-love-500 dark:text-gold-400 hover:text-love-600 dark:hover:text-gold-300 hover:bg-love-50 dark:hover:bg-purple-800 transition-all relative z-[51]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu full screen overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-white/95 dark:bg-[#1A0B2E]/95 backdrop-blur-xl z-[50] transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-6 pt-16">
          {sections.map((section, idx) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleScrollToSection(e, section.id)}
              className="text-2xl font-serif text-gray-800 dark:text-gold-100 hover:text-love-500 dark:hover:text-gold-400 transition-colors duration-300 transform"
              style={{ transitionDelay: `${isOpen ? idx * 50 + 100 : 0}ms` }}
            >
              {section.label}
            </a>
          ))}
          
          <div className="mt-8 flex gap-3 text-love-300">
            <Heart size={20} className="fill-love-300 animate-pulse-slow" />
            <Heart size={20} className="fill-love-300 animate-pulse-slow delay-75" />
            <Heart size={20} className="fill-love-300 animate-pulse-slow delay-150" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
