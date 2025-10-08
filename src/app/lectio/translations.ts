// src/app/lectio/translations.ts
import { Language } from "../components/LanguageProvider";

export interface LectioTranslations {
  loading: {
    checking_login: string;
    loading_lectio: string;
  };
  navigation: {
    date: string;
    previous_day: string;
    next_day: string;
    select_date: string;
    back: string;
    next: string;
    steps_title: string;
    step_label: string;
    progress_complete: string;
  };
  bible: {
    selection_label: string;
    biblical_text: string;
    holy_scripture: string;
    fallback_title: string;
  };
  audio: {
    recordings: string;
    playback_mode: string;
    no_background: string;
    background_short: string;
    background_long: string;
    stop_for_change: string;
    currently_playing: string;
    close_player: string;
    stop: string;
    play: string;
    pause: string;
    player_title: string;
    now_playing: string;
    available_recordings: string;
  };
  sections: {
    lectio: string;
    meditatio: string;
    oratio: string;
    contemplatio: string;
    actio: string;
    reading: string;
    meditation: string;
    prayer: string;
    contemplation: string;
    action: string;
  };
  content: {
    font_size: {
      small: string;
      medium: string;
      large: string;
    };
    progress_complete: string;
    steps_title: string;
    step: string;
  };
  actions: {
    add_note: string;
    refresh: string;
    report_error: string;
    try_again: string;
  };
  messages: {
    not_available_title: string;
    not_available_description: string;
    error_report_success: string;
  };
  audio_labels: {
    prayer: string;
    lectio: string;
    meditatio: string;
    oratio: string;
    contemplatio: string;
    actio: string;
  };
  modes: {
    background_short_tooltip: string;
    background_long_tooltip: string;
    no_added_audio: string;
    stop_to_change: string;
  };
}

export const lectioTranslations: Record<Language, LectioTranslations> = {
  sk: {
    loading: {
      checking_login: "Overujem prihlásenie...",
      loading_lectio: "Načítavam Lectio Divina..."
    },
    navigation: {
      date: "Dátum",
      previous_day: "Predchádzajúci deň",
      next_day: "Nasledujúci deň", 
      select_date: "Vybrať dátum",
      back: "Späť",
      next: "Ďalej",
      steps_title: "Kroky Lectio Divina",
      step_label: "Krok",
      progress_complete: "hotovo"
    },
    bible: {
      selection_label: "Výber biblického textu:",
      biblical_text: "Biblický text",
      holy_scripture: "Sväté Písmo",
      fallback_title: "Biblický text"
    },
    audio: {
      recordings: "Audio nahrávky",
      playback_mode: "Režim prehrávania",
      no_background: "Bez pridaného audia",
      background_short: "Meditačné pozadie - krátke",
      background_long: "Meditačné pozadie - dlhšie",
      stop_for_change: "Zastavte audio pre zmenu",
      currently_playing: "Práve hrá:",
      close_player: "Zavrieť prehrávač",
      stop: "Zastaviť",
      play: "Prehrať",
      pause: "Pauza",
      player_title: "Audio prehrávač",
      now_playing: "Práve sa prehráva:",
      available_recordings: "Dostupné nahrávky:"
    },
    sections: {
      lectio: "LECTIO",
      meditatio: "MEDITATIO", 
      oratio: "ORATIO",
      contemplatio: "CONTEMPLATIO",
      actio: "ACTIO",
      reading: "Čítanie",
      meditation: "Rozjímanie",
      prayer: "Modlitba",
      contemplation: "Kontemplácia",
      action: "Konanie"
    },
    content: {
      font_size: {
        small: "Malé písmo",
        medium: "Stredné písmo", 
        large: "Veľké písmo"
      },
      progress_complete: "hotovo",
      steps_title: "Kroky Lectio Divina",
      step: "Krok"
    },
    actions: {
      add_note: "Pridať poznámku",
      refresh: "Obnoviť",
      report_error: "Nahlásiť chybu v texte",
      try_again: "Skúsiť znovu"
    },
    messages: {
      not_available_title: "Lectio Divina nie je dostupná",
      not_available_description: "Pre vybraný dátum a jazyk nie je k dispozícii Lectio Divina.",
      error_report_success: "✓ Hlásenie bolo úspešne odoslané. Ďakujeme za pomoc!"
    },
    audio_labels: {
      prayer: "Modlitba",
      lectio: "Lectio",
      meditatio: "Meditatio", 
      oratio: "Oratio",
      contemplatio: "Contemplatio",
      actio: "Actio"
    },
    modes: {
      background_short_tooltip: "Meditačné pozadie - krátke",
      background_long_tooltip: "Meditačné pozadie - dlhšie",
      no_added_audio: "Bez pridaného audia",
      stop_to_change: "Zastavte audio pre zmenu"
    }
  },
  cz: {
    loading: {
      checking_login: "Ověřuji přihlášení...",
      loading_lectio: "Načítám Lectio Divina..."
    },
    navigation: {
      date: "Datum",
      previous_day: "Předchozí den",
      next_day: "Následující den",
      select_date: "Vybrat datum", 
      back: "Zpět",
      next: "Další",
      steps_title: "Kroky Lectio Divina",
      step_label: "Krok",
      progress_complete: "hotovo"
    },
    bible: {
      selection_label: "Výběr biblického textu:",
      biblical_text: "Biblický text",
      holy_scripture: "Svaté Písmo",
      fallback_title: "Biblický text"
    },
    audio: {
      recordings: "Audio nahrávky",
      playback_mode: "Režim přehrávání",
      no_background: "Bez přidaného audia",
      background_short: "Meditační pozadí - krátké",
      background_long: "Meditační pozadí - delší",
      stop_for_change: "Zastavte audio pro změnu",
      currently_playing: "Právě hraje:",
      close_player: "Zavřít přehrávač",
      stop: "Zastavit",
      play: "Přehrát",
      pause: "Pauza",
      player_title: "Audio přehrávač",
      now_playing: "Právě se přehrává:",
      available_recordings: "Dostupné nahrávky:"
    },
    sections: {
      lectio: "LECTIO",
      meditatio: "MEDITATIO",
      oratio: "ORATIO", 
      contemplatio: "CONTEMPLATIO",
      actio: "ACTIO",
      reading: "Čtení",
      meditation: "Rozjímání",
      prayer: "Modlitba",
      contemplation: "Kontemplace",
      action: "Jednání"
    },
    content: {
      font_size: {
        small: "Malé písmo",
        medium: "Střední písmo",
        large: "Velké písmo"
      },
      progress_complete: "hotovo",
      steps_title: "Kroky Lectio Divina",
      step: "Krok"
    },
    actions: {
      add_note: "Přidat poznámku",
      refresh: "Obnovit", 
      report_error: "Nahlásit chybu v textu",
      try_again: "Zkusit znovu"
    },
    messages: {
      not_available_title: "Lectio Divina není dostupná",
      not_available_description: "Pro vybrané datum a jazyk není k dispozici Lectio Divina.",
      error_report_success: "✓ Hlášení bylo úspěšně odesláno. Děkujeme za pomoc!"
    },
    audio_labels: {
      prayer: "Modlitba",
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio", 
      contemplatio: "Contemplatio",
      actio: "Actio"
    },
    modes: {
      background_short_tooltip: "Meditační pozadí - krátké",
      background_long_tooltip: "Meditační pozadí - delší",
      no_added_audio: "Bez přidaného audia",
      stop_to_change: "Zastavte audio pro změnu"
    }
  },
  en: {
    loading: {
      checking_login: "Verifying login...",
      loading_lectio: "Loading Lectio Divina..."
    },
    navigation: {
      date: "Date",
      previous_day: "Previous day",
      next_day: "Next day",
      select_date: "Select date",
      back: "Back",
      next: "Next",
      steps_title: "Lectio Divina Steps",
      step_label: "Step",
      progress_complete: "complete"
    },
    bible: {
      selection_label: "Biblical text selection:",
      biblical_text: "Biblical text",
      holy_scripture: "Holy Scripture",
      fallback_title: "Biblical text"
    },
    audio: {
      recordings: "Audio recordings",
      playback_mode: "Playback mode",
      no_background: "No background audio",
      background_short: "Meditative background - short",
      background_long: "Meditative background - longer",
      stop_for_change: "Stop audio to change",
      currently_playing: "Now playing:",
      close_player: "Close player",
      stop: "Stop",
      play: "Play",
      pause: "Pause",
      player_title: "Audio player",
      now_playing: "Now playing:",
      available_recordings: "Available recordings:"
    },
    sections: {
      lectio: "LECTIO",
      meditatio: "MEDITATIO",
      oratio: "ORATIO",
      contemplatio: "CONTEMPLATIO", 
      actio: "ACTIO",
      reading: "Reading",
      meditation: "Meditation",
      prayer: "Prayer",
      contemplation: "Contemplation",
      action: "Action"
    },
    content: {
      font_size: {
        small: "Small font",
        medium: "Medium font",
        large: "Large font"
      },
      progress_complete: "complete",
      steps_title: "Lectio Divina Steps",
      step: "Step"
    },
    actions: {
      add_note: "Add note",
      refresh: "Refresh",
      report_error: "Report text error",
      try_again: "Try again"
    },
    messages: {
      not_available_title: "Lectio Divina not available",
      not_available_description: "Lectio Divina is not available for the selected date and language.",
      error_report_success: "✓ Report was successfully sent. Thank you for your help!"
    },
    audio_labels: {
      prayer: "Prayer",
      lectio: "Lectio", 
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
      actio: "Actio"
    },
    modes: {
      background_short_tooltip: "Meditative background - short",
      background_long_tooltip: "Meditative background - longer",
      no_added_audio: "No added audio",
      stop_to_change: "Stop audio to change"
    }
  },
  es: {
    loading: {
      checking_login: "Verificando inicio de sesión...",
      loading_lectio: "Cargando Lectio Divina..."
    },
    navigation: {
      date: "Fecha",
      previous_day: "Día anterior", 
      next_day: "Día siguiente",
      select_date: "Seleccionar fecha",
      back: "Atrás",
      next: "Siguiente",
      steps_title: "Pasos de Lectio Divina",
      step_label: "Paso",
      progress_complete: "completo"
    },
    bible: {
      selection_label: "Selección de texto bíblico:",
      biblical_text: "Texto bíblico",
      holy_scripture: "Sagrada Escritura",
      fallback_title: "Texto bíblico"
    },
    audio: {
      recordings: "Grabaciones de audio",
      playback_mode: "Modo de reproducción",
      no_background: "Sin audio de fondo",
      background_short: "Fondo meditativo - corto",
      background_long: "Fondo meditativo - largo",
      stop_for_change: "Detener audio para cambiar",
      currently_playing: "Reproduciendo:",
      close_player: "Cerrar reproductor",
      stop: "Detener",
      play: "Reproducir",
      pause: "Pausa",
      player_title: "Reproductor de audio",
      now_playing: "Reproduciendo ahora:",
      available_recordings: "Grabaciones disponibles:"
    },
    sections: {
      lectio: "LECTIO",
      meditatio: "MEDITATIO",
      oratio: "ORATIO",
      contemplatio: "CONTEMPLATIO",
      actio: "ACTIO",
      reading: "Lectura", 
      meditation: "Meditación",
      prayer: "Oración",
      contemplation: "Contemplación",
      action: "Acción"
    },
    content: {
      font_size: {
        small: "Fuente pequeña",
        medium: "Fuente mediana",
        large: "Fuente grande"
      },
      progress_complete: "completo",
      steps_title: "Pasos de Lectio Divina",
      step: "Paso"
    },
    actions: {
      add_note: "Agregar nota",
      refresh: "Actualizar",
      report_error: "Reportar error en texto",
      try_again: "Intentar de nuevo"
    },
    messages: {
      not_available_title: "Lectio Divina no disponible",
      not_available_description: "Lectio Divina no está disponible para la fecha y idioma seleccionados.",
      error_report_success: "✓ El reporte fue enviado exitosamente. ¡Gracias por tu ayuda!"
    },
    audio_labels: {
      prayer: "Oración",
      lectio: "Lectio",
      meditatio: "Meditatio",
      oratio: "Oratio",
      contemplatio: "Contemplatio",
      actio: "Actio"
    },
    modes: {
      background_short_tooltip: "Fondo meditativo - corto",
      background_long_tooltip: "Fondo meditativo - largo",
      no_added_audio: "Sin audio añadido",
      stop_to_change: "Detener audio para cambiar"
    }
  }
};