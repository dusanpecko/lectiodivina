export interface BulkTranslateSectionTranslations {
  header: {
    title: string;
  };
  
  languages: {
    english: string;
    german: string;
    italian: string;
    french: string;
    spanish: string;
    portuguese: string;
    polish: string;
    czech: string;
    hungarian: string;
    croatian: string;
  };
  
  fields: {
    lectio_text: string;
    meditation_text: string;
    meditation_shorter: string;
    contemplatio_text: string;
    contemplatio_shorter: string;
    contemplatio_prayer: string;
    prayer_intro: string;
    prayer_conclusion: string;
  };
  
  ui: {
    translating: string;
    start_bulk_translation: string;
    translation_in_progress: string;
    current_item: string;
    errors: string;
    translation_completed: string;
    successful_translations: string;
    completed: string;
  };
  
  errors: {
    no_text_fields: string;
    unknown_error: string;
  };
}

export const bulkTranslateSectionTranslations: {
  [key: string]: BulkTranslateSectionTranslations;
} = {
  sk: {
    header: {
      title: "Hromadný preklad obsahu",
    },
    
    languages: {
      english: "Angličtina",
      german: "Nemčina",
      italian: "Taliančina",
      french: "Francúzština",
      spanish: "Španielčina",
      portuguese: "Portugalčina",
      polish: "Poľština",
      czech: "Čeština",
      hungarian: "Maďarčina",
      croatian: "Chorvátčina",
    },
    
    fields: {
      lectio_text: "Lectio text",
      meditation_text: "Meditácia text",
      meditation_shorter: "Meditácia kratšia",
      contemplatio_text: "Kontemplácia text",
      contemplatio_shorter: "Kontemplácia kratšia",
      contemplatio_prayer: "Kontemplácia modlitba",
      prayer_intro: "Modlitba úvod",
      prayer_conclusion: "Modlitba záver",
    },
    
    ui: {
      translating: "Prekladám...",
      start_bulk_translation: "Spustiť hromadný preklad",
      translation_in_progress: "Prebieha preklad...",
      current_item: "Aktuálne",
      errors: "Chyby",
      translation_completed: "Preklad dokončený!",
      successful_translations: "polí úspešne preložených",
      completed: "Dokončené",
    },
    
    errors: {
      no_text_fields: "Žiadne polia s textom na preloženie",
      unknown_error: "Neznáma chyba",
    },
  },

  cz: {
    header: {
      title: "Hromadný překlad obsahu",
    },
    
    languages: {
      english: "Angličtina",
      german: "Němčina",
      italian: "Italština",
      french: "Francouzština",
      spanish: "Španělština",
      portuguese: "Portugalština",
      polish: "Polština",
      czech: "Čeština",
      hungarian: "Maďarština",
      croatian: "Chorvatština",
    },
    
    fields: {
      lectio_text: "Lectio text",
      meditation_text: "Meditace text",
      meditation_shorter: "Meditace kratší",
      contemplatio_text: "Kontemplace text",
      contemplatio_shorter: "Kontemplace kratší",
      contemplatio_prayer: "Kontemplace modlitba",
      prayer_intro: "Modlitba úvod",
      prayer_conclusion: "Modlitba závěr",
    },
    
    ui: {
      translating: "Překládám...",
      start_bulk_translation: "Spustit hromadný překlad",
      translation_in_progress: "Probíhá překlad...",
      current_item: "Aktuálně",
      errors: "Chyby",
      translation_completed: "Překlad dokončen!",
      successful_translations: "polí úspěšně přeložených",
      completed: "Dokončeno",
    },
    
    errors: {
      no_text_fields: "Žádná pole s textem k překladu",
      unknown_error: "Neznámá chyba",
    },
  },

  en: {
    header: {
      title: "Bulk Content Translation",
    },
    
    languages: {
      english: "English",
      german: "German",
      italian: "Italian",
      french: "French",
      spanish: "Spanish",
      portuguese: "Portuguese",
      polish: "Polish",
      czech: "Czech",
      hungarian: "Hungarian",
      croatian: "Croatian",
    },
    
    fields: {
      lectio_text: "Lectio text",
      meditation_text: "Meditation text",
      meditation_shorter: "Meditation shorter",
      contemplatio_text: "Contemplation text",
      contemplatio_shorter: "Contemplation shorter",
      contemplatio_prayer: "Contemplation prayer",
      prayer_intro: "Prayer introduction",
      prayer_conclusion: "Prayer conclusion",
    },
    
    ui: {
      translating: "Translating...",
      start_bulk_translation: "Start Bulk Translation",
      translation_in_progress: "Translation in progress...",
      current_item: "Current",
      errors: "Errors",
      translation_completed: "Translation completed!",
      successful_translations: "fields successfully translated",
      completed: "Completed",
    },
    
    errors: {
      no_text_fields: "No text fields to translate",
      unknown_error: "Unknown error",
    },
  },

  es: {
    header: {
      title: "Traducción Masiva de Contenido",
    },
    
    languages: {
      english: "Inglés",
      german: "Alemán",
      italian: "Italiano",
      french: "Francés",
      spanish: "Español",
      portuguese: "Portugués",
      polish: "Polaco",
      czech: "Checo",
      hungarian: "Húngaro",
      croatian: "Croata",
    },
    
    fields: {
      lectio_text: "Texto Lectio",
      meditation_text: "Texto de meditación",
      meditation_shorter: "Meditación más corta",
      contemplatio_text: "Texto de contemplación",
      contemplatio_shorter: "Contemplación más corta",
      contemplatio_prayer: "Oración de contemplación",
      prayer_intro: "Introducción de oración",
      prayer_conclusion: "Conclusión de oración",
    },
    
    ui: {
      translating: "Traduciendo...",
      start_bulk_translation: "Iniciar Traducción Masiva",
      translation_in_progress: "Traducción en progreso...",
      current_item: "Actual",
      errors: "Errores",
      translation_completed: "¡Traducción completada!",
      successful_translations: "campos traducidos exitosamente",
      completed: "Completado",
    },
    
    errors: {
      no_text_fields: "No hay campos de texto para traducir",
      unknown_error: "Error desconocido",
    },
  },
};