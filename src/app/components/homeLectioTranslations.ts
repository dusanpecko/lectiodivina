// homeLectioTranslations.ts - Preklady pre HomeLectioSection komponent
import type { Language } from "../i18n";

export interface HomeLectioTranslations {
  badge: string;
  title: string;
  locked_sections: {
    lectio: string;
    meditatio: string;
    oratio: string;
    contemplatio: string;
  };
  cta_button_logged_in: string;
  cta_button_logged_out: string;
  benefits: string;
  biblical_text_label: string;
  lectio_label: string;
  audio_available: string;
  lock_tooltip_logged_in: string;
  lock_tooltip_logged_out: string;
}

export const homeLectioTranslations: Record<Language, HomeLectioTranslations> = {
  sk: {
    badge: "Dnešné Lectio Divina",
    title: "Lectio Divina na dnes",
    locked_sections: {
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
    },
    cta_button_logged_in: "Otvoriť Lectio Divina",
    cta_button_logged_out: "Prihlásiť sa zadarmo",
    benefits: "✓ Zadarmo navždy · ✓ Bez reklám · ✓ Denné aktualizácie",
    biblical_text_label: "Biblický text",
    lectio_label: "Lectio",
    audio_available: "Audio dostupné",
    lock_tooltip_logged_in: "Klikni pre celé Lectio",
    lock_tooltip_logged_out: "Prihlás sa",
  },
  cz: {
    badge: "Dnešní Lectio Divina",
    title: "Lectio Divina na dnes",
    locked_sections: {
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
    },
    cta_button_logged_in: "Otevřít Lectio Divina",
    cta_button_logged_out: "Přihlásit se zdarma",
    benefits: "✓ Zdarma navždy · ✓ Bez reklam · ✓ Denní aktualizace",
    biblical_text_label: "Biblický text",
    lectio_label: "Lectio",
    audio_available: "Audio dostupné",
    lock_tooltip_logged_in: "Klikni pro celé Lectio",
    lock_tooltip_logged_out: "Přihlas se",
  },
  en: {
    badge: "Today's Lectio Divina",
    title: "Today's Lectio Divina",
    locked_sections: {
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
    },
    cta_button_logged_in: "Open Lectio Divina",
    cta_button_logged_out: "Sign in for free",
    benefits: "✓ Free forever · ✓ No ads · ✓ Daily updates",
    biblical_text_label: "Biblical text",
    lectio_label: "Lectio",
    audio_available: "Audio available",
    lock_tooltip_logged_in: "Click for full Lectio",
    lock_tooltip_logged_out: "Sign in",
  },
  es: {
    badge: "Lectio Divina de hoy",
    title: "Lectio Divina de hoy",
    locked_sections: {
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
    },
    cta_button_logged_in: "Abrir Lectio Divina",
    cta_button_logged_out: "Iniciar sesión gratis",
    benefits: "✓ Gratis para siempre · ✓ Sin anuncios · ✓ Actualizaciones diarias",
    biblical_text_label: "Texto bíblico",
    lectio_label: "Lectio",
    audio_available: "Audio disponible",
    lock_tooltip_logged_in: "Haz clic para el Lectio completo",
    lock_tooltip_logged_out: "Inicia sesión",
  },
};
