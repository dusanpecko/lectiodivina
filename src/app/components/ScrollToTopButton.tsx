'use client'

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
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
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3, 
        type: "spring", 
        stiffness: 300 
      }}
      onClick={scrollToTop}
      whileHover={{ 
        scale: 1.1, 
        y: -2 
      }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 group"
      aria-label="Scroll to top"
    >
      <div className="relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{ backgroundColor: '#40467b' }}
        ></div>
        
        {/* Button */}
        <div 
          className="relative text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-shadow duration-300"
          style={{ backgroundColor: '#40467b' }}
        >
          <motion.div
            animate={{ y: [-1, 1, -1] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <ChevronUp className="w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}