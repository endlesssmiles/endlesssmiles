
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Timeline from "@/components/Timeline";
import Gallery from "@/components/Gallery";
import LettersSection from "@/components/LettersSection";
import AnniversarySection from "@/components/AnniversarySection";
import FutureSection from "@/components/FutureSection";
import Footer from "@/components/Footer";

const Index = () => {
  // Enhanced scroll reveal effect with better performance
  useEffect(() => {
    const revealSections = () => {
      const sections = document.querySelectorAll('section');
      const options = {
        threshold: 0.15, // Trigger when 15% of the section is visible
        rootMargin: '0px 0px -10% 0px' // Slightly offset the trigger point
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Once the section is revealed, no need to observe it anymore
            observer.unobserve(entry.target);
          }
        });
      }, options);

      sections.forEach(section => {
        observer.observe(section);
      });

      return () => {
        sections.forEach(section => {
          observer.unobserve(section);
        });
      };
    };
    
    // Initialize the intersection observer
    const cleanup = revealSections();
    
    // Cleanup
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <Timeline />
      <Gallery />
      <LettersSection />
      <AnniversarySection />
      <FutureSection />
      <Footer />
    </div>
  );
};

export default Index;
