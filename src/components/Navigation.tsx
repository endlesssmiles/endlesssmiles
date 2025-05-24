import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: "landing", label: "Home" },
    { id: "timeline", label: "Our Story" },
    { id: "gallery", label: "Memories" },
    { id: "letters", label: "Letters" },
    { id: "anniversary", label: "Anniversary" },
    { id: "future", label: "Our Future" },
  ];

  // Handle smooth scrolling
  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);

    if (element) {
      // Close mobile menu if open
      setIsOpen(false);

      // Smooth scroll to the section
      window.scrollTo({
        top: element.offsetTop - 70, // Offset for the navbar
        behavior: "smooth",
      });

      // Update URL without refreshing the page
      window.history.pushState({}, "", `#${sectionId}`);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a
          href="#landing"
          onClick={(e) => handleScrollToSection(e, "landing")}
          className="font-handwritten text-2xl text-love-500 font-semibold"
        >
          Endless Smiles ❤️
        </a>

        <div className="hidden md:flex space-x-6">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleScrollToSection(e, section.id)}
              className="text-sm text-gray-700 hover:text-love-500 transition-colors"
            >
              {section.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-gray-700 hover:text-love-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 shadow-md animate-fade-in">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleScrollToSection(e, section.id)}
                className="py-2 text-gray-700 hover:text-love-500 transition-colors"
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
