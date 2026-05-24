
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import RelationshipStats from "@/components/RelationshipStats";
import Timeline from "@/components/Timeline";
import Gallery from "@/components/Gallery";
import LettersSection from "@/components/LettersSection";
import AnniversarySection from "@/components/AnniversarySection";
import FutureSection from "@/components/FutureSection";
import Footer from "@/components/Footer";
import FloatingHearts from "@/components/FloatingHearts";

const Index = () => {
  // Enhanced scroll reveal effect with better performance
  useEffect(() => {
    const revealSections = () => {
      const sections = document.querySelectorAll('section');
      const options = {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
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
    
    const cleanup = revealSections();
    
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* All page content sits above the hearts */}
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <RelationshipStats />
        <Timeline />
        <Gallery />
        <LettersSection />
        <AnniversarySection />
        <FutureSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
