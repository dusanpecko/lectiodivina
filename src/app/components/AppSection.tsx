// components/AppSection.tsx
"use client";
import type { Translations } from "@/app/i18n";
import Image from "next/image";
import ReviewSlider from "./ReviewSlider";

type AppSectionProps = {
  t: Translations["sk"];
};

export default function AppSection({ t }: AppSectionProps) {
  return (
    <section className="relative min-h-screen py-20 sm:py-32 w-full flex flex-col items-center justify-center overflow-hidden snap-start" style={{ backgroundColor: '#40467b' }}>
      <div className="relative max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 sm:px-8">
        {/* Left: Text & Buttons */}
        <div className="flex-1 w-full text-white flex flex-col justify-center">
          <div className="mb-8">
            <div className="text-base font-semibold mb-2 opacity-80">{t.app_section.tagline}</div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              {t.app_section.p3}
            </h2>
          </div>
          <div className="flex gap-4 mb-8">
            <a href="https://apps.apple.com/sk/app/lectio-divina/id6443882687" target="_blank" rel="noopener">
              <Image 
                src="/apple-store-b.png" 
                alt={t.app_section.apple_store_alt}
                width={144}
                height={48}
                style={{ height: '48px', width: 'auto' }}
                className="rounded-xl shadow transition-all duration-200 hover:opacity-80"
              />
            </a>
            <a href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394" target="_blank" rel="noopener">
              <Image 
                src="/android-store-b.png" 
                alt={t.app_section.google_play_alt}
                width={144}
                height={48}
                style={{ height: '48px', width: 'auto' }}
                className="rounded-xl shadow transition-all duration-200 hover:opacity-80"
              />
            </a>
          </div>
        </div>
        {/* Right: Image with overlay */}
        <div className="flex-1 flex justify-center w-full mt-8 lg:mt-0">
          <div className="relative w-full max-w-xl" style={{ minHeight: 440, maxHeight: 540 }}>
            <Image
              src="/home_intro_1.webp"
              alt={t.app_section.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 576px"
              className="rounded-3xl shadow-2xl object-cover"
            />
            {/* Overlay ReviewSlider */}
            <div className="absolute" style={{ top: '5%', left: '5%', width: '50%', maxWidth: '340px' }}>
              <ReviewSlider reviews={t.review_slider.items} ariaLabel={t.review_slider.aria_label} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
