import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const reviews = [
  {
    author: "Jana H.",
    text: "Úžasná aplikácia, každé ráno sa teším na čítanie a konečne aj rozumiem, čo Boh ku mne hovorí a cítim radosť a pokoj. Vďaka Otec Dušan",
    rating: 5,
    platform: "Google Play"
  },
  {
    author: "Jkb982",
    text: "Úplne odporúčam! Na každý deň úseky z písma, nad ktorými môžem rozjímať. Presne toto som hľadal.",
    rating: 5,
    platform: "App Store"
  },
  {
    author: "Štefan J.",
    text: "Výborná pomôcka k duchovnému zreniu. Apka vyhotovená prehľadne a obsahuje moderné prvky. Vďaka za službu :)",
    rating: 5,
    platform: "Google Play"
  },
  {
    author: "Ummarti",
    text: "Skvelá práca. Aplikáciu používam denne. Oceňujem možnosť texty si vypočuť a dokonca v rôznych prekladoch👍 Krátke zamyslenia sú tak trefné a často mi otvoria nový pohľad na \"známy text\" Sv Písma. Ďakujem aj za \"Advent\" všetky zamyslenia a najmä vysvetľujúce komentáre. Vďaka za Váš čas a námahu.🙏",
    rating: 5,
    platform: "Google Play"
  },
  {
    author: "Vladislav H.",
    text: "Texty na meditáciu, viacero prekladov na jednom mieste, ako aj zamyslenia ako inšpirácia. Pre mňa skvelý pomocník pre rast v duchovnom živote",
    rating: 5,
    platform: "Google Play"
  }
];

export default function ReviewSlider() {
  const [index, setIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="w-full flex flex-col items-center"
      style={{
        minHeight: '400px',
        padding: '24px 20px',
        background: 'rgba(255,255,255,0.18)',
        borderRadius: '1.25rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.35)'
      }}
    >
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex-1"
      >
        <div className="mb-2 text-lg font-bold" style={{ color: '#40467b' }}>{reviews[index].author}</div>
        <div className="flex justify-start mb-2">
          {Array.from({ length: reviews[index].rating }).map((_, i) => (
            <span key={i} style={{ color: '#40467b', fontSize: '1.3rem', marginRight: 2 }}>★</span>
          ))}
        </div>
        <p className="text-base text-gray-900 font-normal mb-4">{reviews[index].text}</p>
        <div className="text-sm font-semibold" style={{ color: reviews[index].platform === 'Google Play' ? '#686ea3' : '#40467b' }}>
          {reviews[index].platform}
        </div>
      </motion.div>
      
      {/* Dot indicators */}
      <div className="flex gap-2 mt-4">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: index === i ? '12px' : '8px',
              height: index === i ? '12px' : '8px',
              backgroundColor: index === i ? '#40467b' : 'rgba(64, 70, 123, 0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label={`Go to review ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
