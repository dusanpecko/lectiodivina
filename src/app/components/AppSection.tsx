// components/AppSection.tsx
"use client";
import { motion } from "framer-motion";
import ReviewSlider from "./ReviewSlider";
import { ArrowRight, Heart } from "lucide-react";

export default function AppSection({ t }: { t: any }) {
  return (
    <section className="relative min-h-screen py-20 sm:py-32 w-full flex flex-col items-center justify-center overflow-hidden snap-start" style={{ backgroundColor: '#40467b' }}>
      <div className="relative max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 sm:px-8">
        {/* Left: Text & Buttons */}
        <div className="flex-1 w-full text-white flex flex-col justify-center">
          <div className="mb-8">
            <div className="text-base font-semibold mb-2 opacity-80">Dať Božiemu Slovu priestor vo vašom srdci. </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              Stiahnite si aplikáciu Lectio Divina ešte dnes a začnite svoju cestu k hlbšiemu vzťahu s Bohom!
            </h2>
          </div>
          <div className="flex gap-4 mb-8">
            <a href="https://apps.apple.com/sk/app/lectio-divina/id6443882687" target="_blank" rel="noopener">
              <img 
                src="/apple-store-b.png" 
                alt="App Store" 
                className="h-12 rounded-xl shadow transition-all duration-200"
                onMouseOver={e => (e.currentTarget.src = '/apple-store.png')}
                onMouseOut={e => (e.currentTarget.src = '/apple-store-b.png')}
              />
            </a>
            <a href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394" target="_blank" rel="noopener">
              <img 
                src="/android-store-b.png" 
                alt="Google Play" 
                className="h-12 rounded-xl shadow transition-all duration-200"
                onMouseOver={e => (e.currentTarget.src = '/android-store.png')}
                onMouseOut={e => (e.currentTarget.src = '/android-store-b.png')}
              />
            </a>
          </div>
        </div>
        {/* Right: Image with overlay */}
        <div className="flex-1 flex justify-center w-full mt-8 lg:mt-0">
          <div className="relative w-full max-w-xl">
            <img
              src="/home_intro_1.webp"
              alt="Lectio app preview"
              className="rounded-3xl shadow-2xl w-full object-cover"
              style={{ minHeight: 440, maxHeight: 540 }}
            />
            {/* Overlay ReviewSlider */}
            <div className="absolute" style={{ top: '5%', left: '5%', width: '50%', maxWidth: '340px' }}>
              <ReviewSlider />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
