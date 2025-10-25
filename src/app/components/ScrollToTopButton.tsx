'use client'

import { useMotionValueEvent, useScroll } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function ScrollToTopButton() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  
  // Skryť button na admin stránkach
  const isAdminZone = pathname?.startsWith('/admin');
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 500);
  });
  
  if (isAdminZone) return null;

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 group transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
    >
      <div className="relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{ backgroundColor: '#40467b' }}
        ></div>
        
        {/* Button */}
        <div 
          className="relative text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: '#40467b' }}
        >
          <ChevronUp className="w-6 h-6" />
        </div>
      </div>
    </button>
  );
}