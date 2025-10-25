export interface RoadmapTranslations {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  milestones: {
    start: {
      date: string;
      title: string;
      description: string;
    };
    branding: {
      date: string;
      title: string;
      description: string;
    };
    website: {
      date: string;
      title: string;
      description: string;
    };
    flutter: {
      date: string;
      title: string;
      description: string;
    };
    expansion: {
      date: string;
      title: string;
      description: string;
    };
    portuguese: {
      date: string;
      title: string;
      description: string;
    };
  };
}

export const roadmapTranslations: Record<string, RoadmapTranslations> = {
  sk: {
    badge: "ČO SME VYBUDOVALI, ČO PRÁVE TVORÍME A ČO CHYSTÁME",
    title: "Cesta, po ktorej kráčame",
    subtitle: "Míľniky Lectio Divina",
    description: "Spoločne rastieme a šírime modlitbu do celého sveta. Každý krok nesie pečať vašej dôvery a našej oddanosti.",
    milestones: {
      start: {
        date: "11/2022",
        title: "Začiatok projektu",
        description: "Prvý prototyp v SiberianCMS. Jazyk: SK."
      },
      branding: {
        date: "10/2025",
        title: "Nové logo a branding",
        description: "Nová vizuálna identita pre Lectio.one – čistá, zrozumiteľná, pripravená na rast."
      },
      website: {
        date: "11/2025",
        title: "Nová webová stránka",
        description: "Spúšťame lectio.one – rýchlejšia, čistejšia, pripravená pre komunitu."
      },
      flutter: {
        date: "1Q/2026",
        title: "Flutter aplikácia",
        description: "Oficiálna mobilná aplikácia pre iOS a Android. Jazyky: SK / EN / ES."
      },
      expansion: {
        date: "4Q/2026",
        title: "Rozšírenie jazykov",
        description: "Pridávame IT / DE – ešte viac sŕdc, ktoré sa môžu modliť spolu."
      },
      portuguese: {
        date: "1Q/2027",
        title: "Portugalský jazyk",
        description: "Spúšťame PT – otvárame dvere lusofónnemu svetu."
      }
    }
  },
  cz: {
    badge: "CO JSME VYBUDOVALI, CO PRÁVĚ TVOŘÍME A CO CHYSTÁME",
    title: "Cesta, po které kráčíme",
    subtitle: "Milníky Lectio Divina",
    description: "Společně rosteme a šíříme modlitbu do celého světa. Každý krok nese pečeť vaší důvěry a našeho odhodlání.",
    milestones: {
      start: {
        date: "11/2022",
        title: "Začátek projektu",
        description: "První prototyp v SiberianCMS. Jazyk: SK."
      },
      branding: {
        date: "10/2025",
        title: "Nové logo a branding",
        description: "Nová vizuální identita pro Lectio.one – čistá, srozumitelná, připravená k růstu."
      },
      website: {
        date: "11/2025",
        title: "Nová webová stránka",
        description: "Spouštíme lectio.one – rychlejší, čistší, připravená pro komunitu."
      },
      flutter: {
        date: "1Q/2026",
        title: "Flutter aplikace",
        description: "Oficiální mobilní aplikace pro iOS a Android. Jazyky: SK / EN / ES."
      },
      expansion: {
        date: "4Q/2026",
        title: "Rozšíření jazyků",
        description: "Přidáváme IT / DE – ještě více srdcí, která se mohou modlit společně."
      },
      portuguese: {
        date: "1Q/2027",
        title: "Portugalský jazyk",
        description: "Spouštíme PT – otevíráme dveře lusofonnímu světu."
      }
    }
  },
  en: {
    badge: "WHAT WE HAVE BUILT, WHAT WE ARE CREATING, AND WHAT WE ARE PREPARING",
    title: "The path we walk",
    subtitle: "Lectio Divina Milestones",
    description: "Together we grow and spread prayer throughout the world. Every step bears the mark of your trust and our dedication.",
    milestones: {
      start: {
        date: "11/2022",
        title: "Project Start",
        description: "First prototype in SiberianCMS. Language: SK."
      },
      branding: {
        date: "10/2025",
        title: "New Logo & Branding",
        description: "New visual identity for Lectio.one – clean, clear, ready to grow."
      },
      website: {
        date: "11/2025",
        title: "New Website",
        description: "Launching lectio.one – faster, cleaner, ready for the community."
      },
      flutter: {
        date: "Q1/2026",
        title: "Flutter App",
        description: "Official mobile app for iOS and Android. Languages: SK / EN / ES."
      },
      expansion: {
        date: "Q4/2026",
        title: "Language Expansion",
        description: "Adding IT / DE – even more hearts that can pray together."
      },
      portuguese: {
        date: "Q1/2027",
        title: "Portuguese Language",
        description: "Launching PT – opening doors to the Lusophone world."
      }
    }
  },
  es: {
    badge: "LO QUE HEMOS CONSTRUIDO, LO QUE ESTAMOS CREANDO Y LO QUE PREPARAMOS",
    title: "El camino que recorremos",
    subtitle: "Hitos de Lectio Divina",
    description: "Juntos crecemos y difundimos la oración por todo el mundo. Cada paso lleva la marca de tu confianza y nuestra dedicación.",
    milestones: {
      start: {
        date: "11/2022",
        title: "Inicio del proyecto",
        description: "Primer prototipo en SiberianCMS. Idioma: SK."
      },
      branding: {
        date: "10/2025",
        title: "Nuevo logo y marca",
        description: "Nueva identidad visual para Lectio.one – limpia, clara, lista para crecer."
      },
      website: {
        date: "11/2025",
        title: "Nuevo sitio web",
        description: "Lanzamos lectio.one – más rápido, más limpio, listo para la comunidad."
      },
      flutter: {
        date: "T1/2026",
        title: "Aplicación Flutter",
        description: "Aplicación móvil oficial para iOS y Android. Idiomas: SK / EN / ES."
      },
      expansion: {
        date: "T4/2026",
        title: "Expansión de idiomas",
        description: "Añadimos IT / DE – aún más corazones que pueden orar juntos."
      },
      portuguese: {
        date: "T1/2027",
        title: "Idioma portugués",
        description: "Lanzamos PT – abriendo puertas al mundo lusófono."
      }
    }
  }
};
